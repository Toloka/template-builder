import { alwaysPassSchema, isGettable, primitiveValuesArrayToSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.button-radio-group', {
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
                            default: 'label'
                        },
                        value: {
                            $ref: '#/definitions/any',
                            default: 'value'
                        },
                        hint: {
                            type: 'string',
                            default: ''
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
            type: 'field.button-radio-group',
            label: 'Button Radio Group',
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
    },
    rtlProps: true
});

export const getDataSchema = (props: any) => {
    if (isGettable(props.options) || !props.options || !Array.isArray(props.options)) {
        return alwaysPassSchema;
    }

    return primitiveValuesArrayToSchema(props.options.map((option: any) => option && option.value));
};
