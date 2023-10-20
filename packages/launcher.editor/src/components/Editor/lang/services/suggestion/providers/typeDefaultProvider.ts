/* eslint-disable no-template-curly-in-string */
import { languages } from 'monaco-editor';

import { AutoCompleteProvider, makeResult, makeSnippet, ProviderResult } from '../suggestionTypes';

const typeDefaults = {
    integer: [1, 5, 10, 15],
    number: [0.5, 1, 5, 10],
    string: [''],
    boolean: [true, false],
    object: [{ snippet: true, value: '{${0}}' }],
    array: [{ snippet: true, value: '[${0}]' }],
    null: [null]
} as const;

export const typeDefaultProvider: AutoCompleteProvider = (expectations) => {
    if (expectations.expectedType !== 'value') return [];

    const suggestions: ProviderResult[] = [];

    Object.entries(typeDefaults).forEach(([key, value]) => {
        const trait = key as keyof typeof typeDefaults;
        const defaults: readonly any[] = value;

        if (expectations.isExpected([trait]) || expectations.isExpected(['data'])) {
            suggestions.push(
                ...defaults.map((def) => {
                    if (def && typeof def === 'object' && 'snippet' in def) {
                        return makeSnippet(def.value, 70, { kind: languages.CompletionItemKind.Value });
                    }

                    return makeResult(def, 1, { kind: languages.CompletionItemKind.Value });
                })
            );
        }
    });

    return suggestions;
};
