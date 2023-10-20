import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.phone-number', {
    schema: {
        type: 'object',
        properties: {
            placeholder: {
                type: 'string',
                default: 'Text'
            }
        },
        default: {
            type: 'field.phone-number',
            label: 'Number',
            data: {
                type: 'data.output',
                path: 'data'
            }
        },
        required: []
    }
});

export const getDataSchema = () => ({ type: 'string' });
