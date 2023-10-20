import { AutoCompleteProvider, makeResult } from '../suggestionTypes';

export const $emptyProvider: AutoCompleteProvider = (expectations) => {
    if (expectations.expectedType !== 'value') return [];

    if (expectations.isExpected(['null'])) {
        return [makeResult({ $empty: true }, 5)];
    }

    return [];
};
