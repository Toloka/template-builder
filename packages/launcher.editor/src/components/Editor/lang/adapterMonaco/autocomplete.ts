import { ArrayNode, ObjectNode, parseJSON } from '@toloka-tb/lang.json';
import { reaction } from 'mobx';
import { editor, IPosition, IRange, languages, Position } from 'monaco-editor';

import { tbStore } from '../../../../store/tbStore';
import { ComponentPath, getComponentPath } from '../ast/astUtils';
import { deriveExpectations, ExpectationManager } from '../expectations/expectations';
import { suggest } from '../services/suggestion/autocomplete';
import { setEditors } from '../typeHandlers/typeHandlers';
import { normalizeDescriptionUrls } from '../utils/normalizeDescriptionUrls';

const noop = () => undefined;
const toRange = (from: IPosition, to: IPosition): IRange => ({
    startLineNumber: from.lineNumber,
    startColumn: from.column,
    endLineNumber: to.lineNumber,
    endColumn: to.column
});

const needCommaBefore = (
    componentPath: ComponentPath,
    expectations: ExpectationManager,
    cursorOffset: number,
    text: string
) => {
    if (componentPath.tail.type === 'missing' && expectations.isExpected(['root'])) {
        return false;
    }

    if (!['object', 'array', 'missing'].includes(componentPath.tail.type)) {
        return false;
    }

    const prevText = text.substr(0, cursorOffset).replace(/\s/g, '');

    const prevSymbol = prevText[prevText.length - 1];

    if (/[\]}"\da-zA-Z]/.test(prevSymbol)) {
        return true;
    }

    return false;
};

const getContext = (componentPath: ComponentPath) => {
    if (componentPath.tail.type === 'object' || componentPath.tail.type === 'array') return componentPath.tail;

    let currentNode: ObjectNode | ArrayNode = componentPath.node;
    const path = componentPath.path.slice(0, -1);

    for (const chunk of path) {
        if (typeof chunk === 'string' && currentNode.type === 'object') {
            const prop = currentNode.props.find((prop) => prop.key.type === 'key' && prop.key.value === chunk)
                ?.value as any;

            if ('value' in prop) {
                currentNode = prop.value;
            } else {
                currentNode = prop;
            }
        }

        if (typeof chunk === 'number' && currentNode.type === 'array') {
            currentNode = currentNode.items[chunk] as any;
        }
    }

    return currentNode;
};

const needCommaAfter = (
    componentPath: ComponentPath,
    expectations: ExpectationManager,
    cursorOffset: number,
    text: string
) => {
    if (componentPath.tail.type === 'missing' && expectations.isExpected(['root'])) {
        return false;
    }

    if (componentPath.kind !== 'value') {
        return false;
    }

    if (!['object', 'array', 'missing'].includes(componentPath.tail.type)) {
        return false;
    }

    const context = getContext(componentPath);

    if (context.type === 'array') {
        if (context.items.length === 0) {
            return false;
        }

        const nextText = text.substr(cursorOffset).replace(/\s/g, '');
        const hasComma = nextText[0] === ',';
        const lastEveryItem = context.items[context.items.length - 1];
        const isLast = lastEveryItem && lastEveryItem.from < cursorOffset;

        return !hasComma && !isLast;
    } else {
        if (context.props.length === 0) {
            return false;
        }

        const prevText = text.substring(componentPath.tail.from, cursorOffset).replace(/\s/g, '');
        const nextText = text.substr(cursorOffset).replace(/\s/g, '');

        const hasComma = nextText[0] === ',';
        const isLast = nextText[0] !== '"';
        const isPropertyValue = prevText.length === 0 || prevText[prevText.length - 1] === ':';

        return !hasComma && !isLast && isPropertyValue;
    }
};

reaction(() => tbStore.editors, setEditors);

export class CompletionAdapter implements languages.CompletionItemProvider {
    public get triggerCharacters(): string[] {
        return [' ', ':'];
    }

    async provideCompletionItems(model: editor.IReadOnlyModel, position: Position) {
        const value = model.getValue();
        const ast = parseJSON(value);
        const offset = model.getOffsetAt(position);

        const componentPath = getComponentPath(ast.value || { type: 'missing', from: 0, to: 0 }, offset);
        const suggestions = suggest(componentPath);
        const expectations = deriveExpectations(componentPath, { expectFilledCollections: true });

        if (
            (componentPath.tail.type === 'object' || componentPath.tail.type === 'array') &&
            componentPath.tail.to === offset
        ) {
            return {
                suggestions: []
            };
        }

        let range: IRange | undefined;

        if (componentPath.tail.type !== 'object' && componentPath.tail.type !== 'array') {
            let from = model.getPositionAt(componentPath.tail.from);
            const to = model.getPositionAt(componentPath.tail.to);

            if (model.getWordAtPosition(from) === null) {
                const text = model.getValueInRange(toRange(from, to));
                const nextLineBreakIdx = text.indexOf('\n', 1);

                if (text[0] === '\n' && nextLineBreakIdx !== -1) {
                    from = model.getPositionAt(componentPath.tail.from + nextLineBreakIdx - 1);
                }
            }
            range = toRange(from, to);
        }

        const commaBefore = needCommaBefore(componentPath, expectations.manager, offset, value);
        const commaAfter = needCommaAfter(componentPath, expectations.manager, offset, value);

        const result: languages.CompletionList = {
            suggestions: suggestions.map(
                (suggestion): languages.CompletionItem => {
                    let insertText = suggestion.value;

                    let command: languages.Command | undefined = {
                        title: 'Document formatting',
                        id: 'editor.action.formatDocument',
                        arguments: [false]
                    };

                    // instantly call value autocompletion after a key is chosen
                    if (expectations.manager.expectedType === 'key' || suggestion.snippet) {
                        command = {
                            title: 'Key-Value autocomplete',
                            id: 'editor.action.triggerSuggest',
                            arguments: [false]
                        };
                    }

                    if (expectations.manager.expectedType === 'key') {
                        insertText = `${insertText}:`;
                    }

                    if (commaBefore) {
                        insertText = `,${insertText}`;
                    }
                    if (commaAfter) {
                        insertText = `${insertText},`;
                    }

                    return {
                        label: suggestion.label,
                        insertText,
                        kind: suggestion.kind,
                        // weird hack to sort items the way we want
                        sortText: String(1e8 - suggestion.priority).padStart(8, '0'),
                        insertTextRules: suggestion.snippet
                            ? languages.CompletionItemInsertTextRule.InsertAsSnippet
                            : 0,
                        filterText: suggestion.label,
                        // monaco actually accepts undefined
                        range: range!,
                        documentation: suggestion.documentation && {
                            value: normalizeDescriptionUrls(suggestion.documentation),
                            isTrusted: true
                        },
                        command
                    };
                }
            ),

            incomplete: true,
            dispose: noop
        };

        return result;
    }
}
