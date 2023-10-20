import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.labeled-list', {
    schema: {
        type: 'object',
        properties: {
            minWidth: {
                type: 'number',
                default: 150,
                docDefault: 'labelsWidth'
            },
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string'
                        },
                        hint: {
                            type: 'string'
                        },
                        centerLabel: {
                            type: 'boolean'
                        },
                        content: {
                            $ref: '#/definitions/view'
                        }
                    },
                    default: {
                        label: 'Label',
                        content: { type: 'view.text', content: 'Element content' }
                    },
                    required: ['label', 'content']
                },
                default: []
            }
        },
        default: {
            type: 'view.labeled-list',
            items: [
                {
                    label: 'Element 1',
                    content: { type: 'view.text', content: 'Element content' }
                },
                {
                    label: 'Element 2',
                    content: { type: 'view.text', content: 'Element content' }
                },
                {
                    label: 'Element 3',
                    content: { type: 'view.text', content: 'Element content' }
                }
            ]
        },
        required: ['items']
    }
});
