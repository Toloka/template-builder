import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionRequiredProps } from './condition.required';

export const schema = makeConditionSchema('condition.required', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            }
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionRequiredProps> = () => {
    return {
        schema: true,
        required: true
    };
};
