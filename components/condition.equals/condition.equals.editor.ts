import { alwaysPassSchema, Condition2Schema, isGettable } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';
import { default as convertObjectToSchema } from 'to-json-schema';

import { ConditionEqualsProps } from './condition.equals';

export const schema = makeConditionSchema('condition.equals', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            },
            to: {
                $ref: '#/definitions/data'
            }
        },
        required: ['to'],
        default: {
            type: 'condition.equals',
            to: 10
        }
    }
});

const safeConvertObjectToSchema = (obj: object) => {
    const schema = convertObjectToSchema(obj);

    if (typeof schema === 'boolean') return {};

    return schema;
};

export const condition2Schema: Condition2Schema<ConditionEqualsProps> = (props) => ({
    schema: isGettable(props.to) ? alwaysPassSchema : { ...safeConvertObjectToSchema(props.to), const: props.to },
    required: false
});
