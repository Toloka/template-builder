import { TbJSONSchema } from '@toloka-tb/component2schema';
import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.checkbox-group', {
    booleanField: true,
    schema: {
        type: 'object',
        properties: {
            disabled: {
                type: 'boolean'
            },
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
                            type: 'string',
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
            }
        },
        default: {
            type: 'field.checkbox-group',
            label: 'Checkbox Group',
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
                path: ''
            },
            validation: {
                type: 'condition.required'
            }
        },
        required: ['options']
    }
}) as TbJSONSchema;

export const getDataSchema = (props: any) => {
    if (
        props.options &&
        Array.isArray(props.options) &&
        props.options.every((option: any) => typeof option.value === 'string')
    ) {
        const result: any = { type: 'object', properties: {} };

        for (const option of props.options) {
            result.properties[option.value] = { type: 'boolean' };
        }

        return result;
    } else {
        return { type: 'object' };
    }
};
