import { JSONSchema7 } from 'json-schema';
import { languages } from 'monaco-editor';

import { componentTranslateSchema } from '../../../../../../i18n/componentsI18n';
import { idmStore } from '../../../../../../store/idmStore';
import { ComponentPath } from '../../../ast/astUtils';
import { typeHandlers } from '../../../typeHandlers/typeHandlers';
import { extendConditionSchemaDefault } from '../../../utils/conditionExtenders';
import { getPossibleSuggestedTypes, getTbTypeDoc } from '../../../utils/getPossibleTypes';
import { getTypePriority } from '../../../utils/getTypePriority';
import { AutoCompleteProvider, makeResult, ProviderResult } from '../suggestionTypes';

const makeTbResult = (type: string, originalSchema: JSONSchema7, componentPath: ComponentPath) => {
    const schema = extendConditionSchemaDefault(originalSchema, componentPath);

    return makeResult(schema.default, getTypePriority(type, componentPath), {
        label: type,
        kind: languages.CompletionItemKind.Class,
        documentation: getTbTypeDoc(schema)
    });
};

export const tbValuesProvider: AutoCompleteProvider = (expectations, { componentPath }) => {
    if (expectations.expectedType !== 'value') return [];

    const suggestions: ProviderResult[] = [];
    const types = getPossibleSuggestedTypes(expectations, componentPath, idmStore).filter((type) => {
        if (!type.startsWith('@')) return true;

        return idmStore[type.split('/')[0] as keyof typeof idmStore];
    });

    for (const type of types) {
        const handler = typeHandlers[type];

        if (handler && typeof handler.schema === 'object') {
            suggestions.push(makeTbResult(type, componentTranslateSchema(type, handler.schema, []), componentPath));
        }
    }

    return suggestions;
};
