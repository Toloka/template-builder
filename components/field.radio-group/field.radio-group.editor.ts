import { alwaysPassSchema, isGettable, primitiveValuesArrayToSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.radio-group', {
    schema: {
        type: 'object',
        title: 'field.radio-group',
        properties: {
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
                type: 'boolean'
            }
        },
        default: {
            type: 'field.radio-group',
            label: 'Label',
            options: [
                {
                    label: 'Hello',
                    value: 'hello'
                },
                {
                    label: 'World',
                    value: 'world'
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
