import { componentTranslateSchema } from '../../../../../../i18n/componentsI18n';
import { idmStore } from '../../../../../../store/idmStore';
import { typeHandlers } from '../../../typeHandlers/typeHandlers';
import { getPossibleSuggestedTypes, getTbTypeDoc } from '../../../utils/getPossibleTypes';
import { getTypePriority } from '../../../utils/getTypePriority';
import { AutoCompleteProvider, makeResult } from '../suggestionTypes';

export const typeProvider: AutoCompleteProvider = (expectations, { componentPath }) => {
    if (expectations.expectedType !== 'type') return [];

    return getPossibleSuggestedTypes(expectations, componentPath, idmStore).map((key) => {
        const handler = typeHandlers[key];

        return makeResult(key, getTypePriority(key, componentPath), {
            documentation: handler ? getTbTypeDoc(componentTranslateSchema(key, handler.schema, [])) : undefined
        });
    });
};
