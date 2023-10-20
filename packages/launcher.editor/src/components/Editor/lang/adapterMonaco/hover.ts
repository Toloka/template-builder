import { parseJSON } from '@toloka-tb/lang.json';
import { editor, languages, Position } from 'monaco-editor';

import { getComponentPath } from '../ast/astUtils';
import { getHint } from '../services/help/help';
import { normalizeDescriptionUrls } from '../utils/normalizeDescriptionUrls';

export class HoverAdapter implements languages.HoverProvider {
    async provideHover(model: editor.IReadOnlyModel, position: Position) {
        const ast = parseJSON(model.getValue());

        if (!ast.value) return;

        const componentPath = getComponentPath(ast.value, model.getOffsetAt(position));
        const hint = getHint(componentPath);

        if (hint) {
            return { contents: [{ value: normalizeDescriptionUrls(hint), isTrusted: true }] };
        }
    }
}
