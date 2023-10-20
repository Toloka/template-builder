import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.json', {
    schema: {
        type: 'object',
        properties: {
            label: {
                type: 'string',
                default: 'root'
            },
            content: {
                type: 'object',

                additionalProperties: true
            }
        },
        default: {
            type: 'view.json',
            content: {
                some: 'data'
            }
        },
        required: ['content']
    }
});
