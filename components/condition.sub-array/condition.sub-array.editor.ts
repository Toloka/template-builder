import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionSubArrayProps } from './condition.sub-array';

export const schema = makeConditionSchema('condition.sub-array', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            },
            parent: {
                $ref: '#/definitions/data'
            }
        },
        default: {
            type: 'condition.sub-array',
            parent: {
                type: 'data.output',
                path: 'path'
            }
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionSubArrayProps> = () => {
    return {
        schema: true,
        required: false
    };
};
