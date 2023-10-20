import { TbJSONSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.checkbox', {
    booleanField: true,
    schema: {
        type: 'object',
        title: 'field.checkbox',
        properties: {
            disabled: {
                type: 'boolean'
            }
        },
        default: {
            type: 'field.checkbox',
            label: 'Label',
            data: {
                type: 'data.output',
                path: 'path'
            }
        },
        required: []
    }
}) as TbJSONSchema;

export const getDataSchema = () => ({ type: 'boolean' });
