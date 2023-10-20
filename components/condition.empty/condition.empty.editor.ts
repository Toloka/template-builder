import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionEmptyProps } from './condition.empty';

export const schema = makeConditionSchema('condition.empty', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            }
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionEmptyProps> = () => {
    return {
        schema: {
            anyOf: [
                {
                    type: 'null'
                },
                {
                    type: 'object',
                    properties: {},
                    additionalProperties: false
                },
                {
                    type: 'array',
                    maxItems: 0
                },
                {
                    type: 'string',
                    maxLength: 0
                }
            ]
        },
        required: false
    };
};
