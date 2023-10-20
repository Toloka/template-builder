import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.text', {
    schema: {
        type: 'object',
        title: 'field.text',
        properties: {
            placeholder: {
                type: 'string',
                default: 'Text'
            },
            disabled: {
                type: 'boolean'
            }
        },
        default: {
            type: 'field.text',
            label: 'Text',
            placeholder: 'Nothing typed there...',
            data: {
                type: 'data.output',
                path: 'some.deep.data.text'
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
