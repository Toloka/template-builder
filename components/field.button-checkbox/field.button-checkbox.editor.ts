import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.button-checkbox', {
    schema: {
        default: {
            type: 'field.button-checkbox',
            label: 'Label',
            data: {
                type: 'data.output',
                path: 'path'
            }
        }
    }
});

export const getDataSchema = () => ({ type: 'boolean' });
