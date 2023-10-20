import merge from 'deepmerge';
import { JSONSchema7 } from 'json-schema';

import { makeSchema } from './make';

const conditionsCommonSchema = {
    properties: {
        hint: {
            type: 'string',
            default: ''
        }
    },
    required: []
};

export const makeConditionSchema = <T extends JSONSchema7>(
    type: string,
    { schema, description, shortDescription }: { schema: T; description?: string; shortDescription?: string }
) => merge(conditionsCommonSchema, makeSchema(type, description, shortDescription, schema));
