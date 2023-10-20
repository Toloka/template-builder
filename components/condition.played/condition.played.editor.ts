import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionPlayedProps } from './condition.played';

export const schema = makeConditionSchema('condition.played', {
    schema: {}
});

export const condition2Schema: Condition2Schema<ConditionPlayedProps> = () => {
    return {
        schema: true,
        required: true
    };
};
