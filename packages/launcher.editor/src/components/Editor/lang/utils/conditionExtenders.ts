import { JSONSchema7 } from 'json-schema';

import { ComponentPath } from '../ast/astUtils';
import { createData } from '../typeHandlers/dataUtils';
import { getArchetype } from './getArchetype';

/*
   field components provides context for default value of "data" property of any condition component
   That file makes the condition "data" property obligatory outside of field components context
*/

export const extendRequiredConditionProps = (originalSchema: JSONSchema7, componentPath: ComponentPath) => {
    if (componentPath.conditionDefaultDataContext) return originalSchema;
    if (!originalSchema.title || getArchetype(originalSchema.title) !== 'condition') return originalSchema;
    if (!originalSchema.properties?.data) return originalSchema;

    const schema = { ...originalSchema };

    if (!Array.isArray(schema.required)) {
        schema.required = ['data'];
    } else {
        schema.required = [...schema.required, 'data'];
    }

    return schema;
};

export const extendConditionSchemaDefault = (originalSchema: JSONSchema7, componentPath: ComponentPath) => {
    if (componentPath.conditionDefaultDataContext) return originalSchema;
    if (!originalSchema.title || getArchetype(originalSchema.title) !== 'condition') return originalSchema;
    if (!originalSchema.properties?.data) return originalSchema;
    if (Array.isArray(originalSchema.default)) return originalSchema;

    const schema = { ...originalSchema };

    if (typeof schema.default !== 'object' || schema.default === null) {
        schema.default = { type: schema.title };
    } else {
        schema.default = { ...schema.default };
    }
    if (typeof (schema.default as any).data !== 'object') {
        (schema.default as any).data = createData('input', 'path');
    }

    return schema;
};
