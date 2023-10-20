import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.with-label', {
    listLayoutProps: true,
    schema: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                const: 'view.with-label',
                default: 'view.with-label'
            },
            label: {
                type: 'string'
            },
            hint: {
                type: 'string'
            },
            items: {
                type: 'array',
                items: {
                    $ref: '#/definitions/view'
                },
                default: []
            }
        },
        default: {
            type: 'view.with-label',

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
        required: ['items', 'label']
    }
});
