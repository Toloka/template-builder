import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.text-annotation', {
    schema: {
        type: 'object',
        title: 'field.text-annotation',
        properties: {
            content: {
                description: '',
                type: 'string',
                default: 'The quick brown fox jumps over the lazy dog'
            },
            labels: {
                description: '',
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    properties: {
                        label: {
                            description: '',
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
                },
                default: [
                    {
                        label: 'label1',
                        value: 'value1'
                    },
                    {
                        label: 'label2',
                        value: 'value2'
                    }
                ]
            },
            disabled: {
                description: '',
                type: 'boolean'
            },
            adjust: {
                enum: ['words'],
                type: 'string'
            }
        },
        required: ['content', 'labels'],
        default: {
            type: 'field.text-annotation',
            content: 'The quick brown fox jumps over the lazy dog',
            data: {
                type: 'data.output',
                path: 'result'
            },
            validation: {
                type: 'condition.required'
            },
            labels: [
                {
                    label: 'Adjectives',
                    value: 'adjective'
                },
                {
                    label: 'Nouns',
                    value: 'noun'
                }
            ],
            adjust: 'words'
        }
    }
});

export const getDataSchema = () => ({
    type: 'array',
    items: {
        type: 'object',
        properties: {
            label: {
                type: 'string'
            },
            offset: {
                type: 'integer'
            },
            length: {
                type: 'integer'
            }
        },
        required: ['label', 'offset', 'length']
    }
});
