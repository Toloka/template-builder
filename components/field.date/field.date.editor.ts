import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.date', {
    schema: {
        properties: {
            placeholder: {
                type: 'string',
                default: 'Text'
            },
            min: {
                type: 'string'
            },
            max: {
                type: 'string'
            },
            format: {
                type: 'string',
                enum: ['date-time', 'date']
            },
            blockList: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        },
        default: {
            type: 'field.date',
            label: 'Date',
            data: {
                type: 'data.output',
                path: 'path'
            },
            format: 'date-time',
            validation: {
                type: 'condition.required'
            }
        },
        required: ['format']
    }
});

export const getDataSchema = () => ({ type: 'string' });
