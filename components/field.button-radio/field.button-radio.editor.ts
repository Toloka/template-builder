import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.button-radio', {
    schema: {
        type: 'object',
        properties: {
            valueToSet: {
                type: 'string',
                default: 'some-data'
            },
            disabled: {
                type: 'boolean'
            }
        },
        default: {
            type: 'field.button-radio',
            label: 'label',
            valueToSet: 'value',
            data: {
                type: 'data.output',
                path: 'path'
            },
            validation: {
                type: 'condition.required'
            }
        }
    },
    rtlProps: true
});

export const getDataSchema = () => ({ type: 'string' });
