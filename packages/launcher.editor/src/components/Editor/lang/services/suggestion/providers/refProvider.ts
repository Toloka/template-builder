import { AutoCompleteProvider, makeResult } from '../suggestionTypes';

export const $refProvider: AutoCompleteProvider = (expectations, { componentPath }) => {
    if (expectations.expectedType !== 'value' || componentPath.type === '$ref' || expectations.isExpected(['root'])) {
        return [];
    }

    return [makeResult({ $ref: 'vars.' }, 6)];
};
