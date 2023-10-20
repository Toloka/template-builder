import { alwaysPassSchema, Condition2Schema, isGettable } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionLessProps } from './condition.less';

export const schema = makeConditionSchema('condition.less', {
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
            type: 'condition.less',
            then: 10
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionLessProps> = (props) => ({
    schema: isGettable(props.then)
        ? alwaysPassSchema
        : { [props.orEquals ? 'maximum' : 'exclusiveMaximum']: props.then, type: 'number' },
    required: false
});
