import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionNotProps } from './condition.not';

export const schema = makeConditionSchema('condition.not', {
    schema: {
        properties: {
            condition: {
                $ref: '#/definitions/condition'
            }
        },
        default: {
            type: 'condition.not',
            condition: {
                type: 'condition.schema',
                data: {
                    type: 'data.input',
                    path: 'code'
                },
                schema: {
                    type: 'number',
                    minimum: 200,
                    maximum: 299
                }
            }
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionNotProps> = (props, transformChild) => {
    const child = transformChild(props.condition);

    return {
        schema: {
            not: child.schema
        },
        required: !child.required,
        invertRequired: true
    };
};
