import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.number', {
    schema: {
        type: 'object',
        properties: {
            maximum: {
                type: 'integer'
            },
            minimum: {
                type: 'integer'
            },
            placeholder: {
                type: 'string',
                default: ''
            }
        },
        default: {
            type: 'field.number',
            label: 'Number',
            placeholder: 'Nothing typed here…',
            data: {
                type: 'data.output',
                path: 'some.deep.data.number'
            },
            validation: {
                type: 'condition.required'
            }
        },
        required: []
    }
});

export const getDataSchema = () => ({ type: 'number' });
