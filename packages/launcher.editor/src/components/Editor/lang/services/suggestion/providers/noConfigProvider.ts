import { AutoCompleteProvider, makeResult } from '../suggestionTypes';

export const noConfigProvider: AutoCompleteProvider = (expectations, { componentPath }) => {
    if (componentPath.tail.type === 'missing' && expectations.isExpected(['root'])) {
        // eslint-disable-next-line no-template-curly-in-string
        return [makeResult('{\n  "view": ${1}\n}', 50, { kind: 5, snippet: true, label: '{ "view": }' })];
    }

    return [];
};
