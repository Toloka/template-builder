import { TbJSONSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.tumbler', {
    booleanField: true,
    schema: {
        type: 'object',
        title: 'field.tumbler',
        properties: {
            disabled: {
                type: 'boolean'
            }
        },
        default: {
            type: 'field.tumbler',
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
