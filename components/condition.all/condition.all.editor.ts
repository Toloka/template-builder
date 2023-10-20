import {
    alwaysPassSchema,
    Condition2Schema,
    isAlwaysPassSchema,
    TbJSONSchemaDefinition
} from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionAllProps } from './condition.all';

export const schema = makeConditionSchema('condition.all', {
    schema: {
        properties: {
            conditions: {
                type: 'array',
                items: {
                    $ref: '#/definitions/condition'
                },
                default: []
            }
        },
        default: {
            type: 'condition.all',
            conditions: []
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionAllProps> = (props, transformChild) => {
    const children = props.conditions.map(transformChild);
    const schemas = children.map(({ schema }) => schema).filter((schema) => !isAlwaysPassSchema(schema));
    const required = children.some(({ required }) => required);
    let schema: TbJSONSchemaDefinition = { allOf: schemas };

    if (schemas.length === 0) {
        schema = alwaysPassSchema;
    } else if (schemas.length === 1) {
        schema = schemas[0];
    }

    return {
        schema,
        required
    };
};
