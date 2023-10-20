import { alwaysPassSchema, isGettable, primitiveValuesArrayToSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.select', {
    schema: {
        type: 'object',
        properties: {
            options: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string',
                            default: 'Option name'
                        },
                        value: {
                            $ref: '#/definitions/any',
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
            placeholder: {
                type: 'string',
                default: 'Nothing selected'
            }
        },
        default: {
            type: 'field.select',
            label: 'Select',
            placeholder: 'Noting selected',
            options: [
                {
                    label: 'Hello',
                    value: 'hello'
                },
                {
                    label: 'World!',
                    value: 'world'
                }
            ],
            data: {
                type: 'data.output',
                path: 'some.deep.data.select'
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
