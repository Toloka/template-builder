import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.email', {
    schema: {
        type: 'object',
        properties: {
            placeholder: {
                type: 'string',
                default: 'Text'
            }
        },
        default: {
            type: 'field.email',
            label: 'Email',
            data: {
                type: 'data.output',
                path: 'data'
            }
        },
        required: []
    }
});

export const getDataSchema = () => ({ type: 'string' });
