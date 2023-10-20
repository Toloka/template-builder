import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.image-annotation', {
    mediaLayoutProps: ['ratio', 'fullHeight', 'minWidth'],
    schema: {
        type: 'object',
        title: 'field.image-annotation',
        properties: {
            image: {
                type: 'string',
                default: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/small.png'
            },
            shapes: {
                type: 'object',
                properties: {
                    point: {
                        type: 'boolean',
                        const: true
                    },
                    rectangle: {
                        type: 'boolean',
                        const: true
                    },
                    polygon: {
                        type: 'boolean',
                        const: true
                    }
                },
                minProperties: 1
            },
            labels: {
                type: 'array',
                minItems: 2,
                items: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string',
                            default: 'label'
                        },
                        value: {
                            type: 'string',
                            default: 'value'
                        }
                    },
                    required: ['label', 'value'],
                    default: {
                        label: 'label',
                        value: 'value'
                    }
                }
            },
            disabled: {
                type: 'boolean',
                default: true
            }
        },
        default: {
            type: 'field.image-annotation',
            image: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/small.png',
            data: {
                type: 'data.output',
                path: 'result'
            },
            validation: {
                type: 'condition.required'
            }
        },
        required: ['image']
    }
});

export const getDataSchema = () => ({
    type: 'array',
    items: {
        anyOf: [
            {
                type: 'object',
                properties: {
                    shape: {
                        type: 'string',
                        const: 'rectangle'
                    },
                    top: {
                        type: 'number'
                    },
                    left: {
                        type: 'number'
                    },
                    height: {
                        type: 'number'
                    },
                    width: {
                        type: 'number'
                    },
                    label: {
                        type: 'string'
                    }
                },
                required: ['shape', 'top', 'left', 'height', 'width']
            },
            {
                type: 'object',
                properties: {
                    shape: {
                        type: 'string',
                        const: 'polygon'
                    },
                    points: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                top: {
                                    type: 'number'
                                },
                                left: {
                                    type: 'number'
                                }
                            },
                            required: ['top', 'left']
                        }
                    },
                    label: {
                        type: 'string'
                    }
                },
                required: ['shape', 'points']
            },
            {
                type: 'object',
                properties: {
                    shape: {
                        type: 'string',
                        const: 'point'
                    },
                    top: {
                        type: 'number'
                    },
                    left: {
                        type: 'number'
                    },
                    label: {
                        type: 'string'
                    }
                },
                required: ['shape', 'top', 'left']
            }
        ]
    }
});
