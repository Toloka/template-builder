import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionFinishedProps } from './condition.played-fully';

export const schema = makeConditionSchema('condition.played-fully', {
    schema: {}
});

export const condition2Schema: Condition2Schema<ConditionFinishedProps> = () => {
    return {
        schema: true,
        required: true
    };
};
