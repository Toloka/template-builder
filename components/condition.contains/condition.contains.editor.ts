import { alwaysPassSchema, Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionContainsProps } from './condition.contains';

export const schema = makeConditionSchema('condition.contains', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            },
            in: {
                type: 'array',
                items: {
                    $ref: '#/definitions/data'
                }
            }
        },
        default: {
            type: 'condition.contains',
            in: {
                type: 'data.input',
                path: 'search_array'
            }
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionContainsProps> = () => ({
    schema: alwaysPassSchema,
    required: false
});
