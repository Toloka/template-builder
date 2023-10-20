import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionLinkOpenedProps } from './condition.link-opened';

export const schema = makeConditionSchema('condition.link-opened', {
    schema: {
        properties: {
            url: {
                type: 'string',
                default: 'https://toloka.ai'
            }
        },
        default: {
            type: 'condition.link-opened',
            url: 'https://toloka.ai'
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionLinkOpenedProps> = () => {
    return {
        schema: true,
        required: true
    };
};
