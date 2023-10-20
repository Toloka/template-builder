import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('layout.columns', {
    label: false,
    hint: false,
    schema: {
        type: 'object',
        properties: {
            verticalAlign: {
                type: 'string',
                enum: ['top', 'middle', 'bottom']
            },
            fullHeight: {
                type: 'boolean'
            },
            ratio: {
                type: 'array',
                items: {
                    type: 'number'
                }
            },
            minWidth: {
                type: 'number'
            },
            items: {
                type: 'array',
                items: {
                    $ref: '#/definitions/view'
                },
                default: [
                    {
                        type: 'view.text',
                        content: 'hello'
                    },
                    {
                        type: 'view.text',
                        content: 'world'
                    }
                ]
            }
        },
        default: {
            type: 'layout.columns',
            items: [
                {
                    type: 'view.text',
                    content: 'hello'
                },
                {
                    type: 'view.text',
                    content: 'world'
                }
            ]
        },
        required: ['type', 'items']
    }
});
