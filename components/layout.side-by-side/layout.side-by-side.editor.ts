import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('layout.side-by-side', {
    label: false,
    hint: false,
    schema: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/definitions/view'
                },
                default: []
            },
            minItemWidth: {
                type: 'number',
                default: 400
            },
            controls: {
                $ref: '#/definitions/view',
                default: {
                    type: 'view.list',
                    items: []
                }
            }
        },
        required: ['type', 'items', 'controls'],
        default: {
            type: 'layout.side-by-side',
            items: [
                {
                    type: 'view.image',
                    url:
                        'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/ya-station-white.png',
                    fullHeight: true
                },
                {
                    type: 'view.image',
                    url:
                        'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/ya-station-black.png',
                    fullHeight: true
                }
            ],
            controls: {
                type: 'view.list',
                items: [
                    {
                        type: 'field.radio-group',
                        label: 'Which product looks most attractive?',
                        options: [
                            {
                                label: 'A',
                                value: 'a'
                            },
                            {
                                label: 'B',
                                value: 'b'
                            },
                            {
                                label: "Images didn't load",
                                value: 'failure'
                            }
                        ],
                        data: {
                            type: 'data.output',
                            path: 'result'
                        }
                    },
                    {
                        type: 'field.textarea',
                        label: 'Please explain why you chose it.',
                        data: {
                            type: 'data.output',
                            path: 'why'
                        }
                    }
                ]
            }
        }
    }
});
