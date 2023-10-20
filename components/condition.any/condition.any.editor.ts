import {
    alwaysPassSchema,
    Condition2Schema,
    isAlwaysPassSchema,
    TbJSONSchemaDefinition
} from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionAnyProps } from './condition.any';

export const schema = makeConditionSchema('condition.any', {
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
            type: 'condition.any',
            conditions: []
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionAnyProps> = (props, transformChild) => {
    const children = props.conditions.map(transformChild);
    const schemas = children.map(({ schema }) => schema);
    const required = children.some(({ required }) => required);
    let schema: TbJSONSchemaDefinition = { anyOf: schemas };

    if (schemas.find((schema) => isAlwaysPassSchema(schema))) {
        schema = alwaysPassSchema;
    } else {
        if (schemas.length === 0) {
            schema = alwaysPassSchema;
        } else if (schemas.length === 1) {
            schema = schemas[0];
        }
    }

    return {
        schema,
        required
    };
};
