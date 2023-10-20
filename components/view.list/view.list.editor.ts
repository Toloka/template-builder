import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.list', {
    listLayoutProps: true,
    schema: {
        type: 'object',
        properties: {
            direction: {
                type: 'string',
                default: true
            },
            items: {
                type: 'array',
                items: {
                    $ref: '#/definitions/view'
                },
                default: []
            },
            size: {
                type: 'string',
                default: true
            }
        },
        default: {
            type: 'view.list',
            items: [
                {
                    type: 'view.text',
                    content: '1'
                },
                {
                    type: 'view.text',
                    content: '2'
                },
                {
                    type: 'view.text',
                    content: '3'
                }
            ]
        },
        required: ['items']
    },
    rtlProps: true
});
