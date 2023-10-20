import { alwaysPassSchema, Condition2Schema, isGettable } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionMoreProps } from './condition.more';

export const schema = makeConditionSchema('condition.more', {
    schema: {
        properties: {
            data: {
                type: 'number'
            },
            then: {
                type: 'number'
            },
            orEquals: {
                type: 'boolean',
                default: false
            }
        },
        default: {
            type: 'condition.more',
            then: 10
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionMoreProps> = (props) => ({
    schema: isGettable(props.then)
        ? alwaysPassSchema
        : { [props.orEquals ? 'minimum' : 'exclusiveMinimum']: props.then, type: 'number' },
    required: false
});
