import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('layout.compare', {
    label: false,
    hint: false,
    description: '',
    schema: {
        type: 'object',
        properties: {
            items: {
                description: '',
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        content: {
                            $ref: '#/definitions/view',
                            description: ''
                        },
                        controls: {
                            $ref: '#/definitions/view',
                            description: ''
                        }
                    }
                }
            },
            commonControls: {
                $ref: '#/definitions/view',
                description: ''
            },
            wideCommonControls: {
                type: 'boolean',
                default: true,
                description: ''
            },
            minWidth: {
                type: 'number',
                default: 400,
                description: ''
            }
        },
        required: ['type', 'items'],
        default: {
            type: 'layout.compare',
            items: [
                {
                    content: {
                        type: 'view.image',
                        fullHeight: true,
                        url:
                            'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/xk8YidkhGjIGOrFm_dL5781YA.svg'
                    },
                    controls: {
                        type: 'field.radio-group',
                        options: [
                            {
                                label: 'Left better',
                                value: 'left'
                            }
                        ],
                        data: {
                            type: 'data.output',
                            path: 'best'
                        }
                    }
                },
                {
                    content: {
                        type: 'view.image',
                        fullHeight: true,
                        url:
                            'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/xk8YidkhGjIGOrFm_dL5781YA.svg'
                    },
                    controls: {
                        type: 'field.radio-group',
                        options: [
                            {
                                label: 'Right better',
                                value: 'right'
                            }
                        ],
                        data: {
                            type: 'data.output',
                            path: 'best'
                        }
                    }
                }
            ]
        }
    }
});
