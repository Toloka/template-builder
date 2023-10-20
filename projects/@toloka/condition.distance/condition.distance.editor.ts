import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionDistanceProps } from './condition.distance';

export const schema = makeConditionSchema('@toloka/condition.distance', {
    schema: {
        properties: {
            max: {
                type: 'number',
                default: 500
            },
            to: {
                type: 'string'
            },
            from: {
                type: 'string',
                default: {
                    type: '@toloka/data.location'
                }
            }
        },
        default: {
            type: '@toloka/condition.distance',
            from: {
                type: '@toloka/data.location'
            },
            to: {
                type: 'data.input',
                path: 'coords'
            },
            max: 500
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionDistanceProps> = () => {
    return {
        schema: true,
        required: false
    };
};
