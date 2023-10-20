import { alwaysPassSchema, isGettable, primitiveValuesArrayToSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.quiz', {
    schema: {
        type: 'object',
        title: 'field.quiz',
        properties: {
            instruction: {
                type: 'string'
            },
            options: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string'
                        },
                        disabled: {
                            type: 'boolean'
                        },
                        border: {
                            type: 'boolean'
                        },
                        key: {
                            type: 'string'
                        },
                        options: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    label: {
                                        type: 'string'
                                    },
                                    value: {
                                        $ref: '#/definitions/any'
                                    },
                                    hint: {
                                        type: 'string'
                                    },
                                    correct: {
                                        type: 'boolean'
                                    }
                                },
                                required: ['label', 'value'],
                                default: {
                                    label: 'label',
                                    value: 'value'
                                }
                            }
                        }
                    },
                    required: ['options', 'key']
                }
            }
        },
        default: {
            type: 'field.quiz',
            options: [
                {
                    label: 'Hello',
                    key: 'hello',
                    options: [
                        {
                            label: 'Hello',
                            value: 'hello'
                        },
                        {
                            label: 'World',
                            value: 'world'
                        }
                    ]
                },
                {
                    label: 'World',
                    key: 'world',
                    options: [
                        {
                            label: 'Hello',
                            value: 'hello'
                        },
                        {
                            label: 'World',
                            value: 'world'
                        }
                    ]
                }
            ],
            data: {
                type: 'data.output',
                path: 'path'
            },
            validation: {
                type: 'condition.required'
            }
        },
        required: ['options']
    }
});

export const getDataSchema = (props: any) => {
    if (isGettable(props.options) || !props.options || !Array.isArray(props.options)) {
        return alwaysPassSchema;
    }

    return primitiveValuesArrayToSchema(props.options.map((option: any) => option && option.value));
};
