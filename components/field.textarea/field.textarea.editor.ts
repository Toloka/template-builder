import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.textarea', {
    schema: {
        type: 'object',
        properties: {
            placeholder: {
                type: 'string',
                default: 'Text'
            },
            resizable: {
                type: 'boolean',
                default: true
            },
            rows: {
                type: 'number',
                default: 4
            },
            disabled: {
                type: 'boolean'
            }
        },
        default: {
            type: 'field.textarea',
            label: 'Textarea',
            placeholder: 'Noting typed there...',
            data: {
                type: 'data.output',
                path: 'some.deep.data.textarea'
            },
            validation: {
                type: 'condition.required'
            }
        },
        required: []
    },
    requiredMark: true,
    rtlProps: true
});

export const getDataSchema = () => ({ type: 'string' });
