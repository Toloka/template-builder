import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.text', {
    schema: {
        type: 'object',
        properties: {
            content: {
                type: 'string',
                default: ''
            }
        },
        default: {
            type: 'view.text',
            content: 'text'
        }
    },
    rtlProps: true
});
