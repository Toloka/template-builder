import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.multi-select', {
    schema: {
        type: 'object',
        title: 'field.multi-select',
        properties: {
            placeholder: {
                type: 'string'
            },
            options: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string',
                            default: ''
                        },
                        value: {
                            type: 'string',
                            default: ''
                        }
                    }
                }
            }
        },
        default: {
            type: 'field.multi-select',
            label: 'Label',
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
                path: 'some.deep.data.multiSelect'
            }
        },
        required: ['options']
    }
});

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
