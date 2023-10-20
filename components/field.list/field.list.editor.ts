import { makeFieldSchema } from '@toloka-tb/schemas/field';

export const schema = makeFieldSchema('field.list', {
    listLayoutProps: true,
    schema: {
        type: 'object',
        properties: {
            buttonLabel: {
                type: 'string',
                default: 'add more'
            },
            render: {
                $ref: '#/definitions/view',
                default: {
                    type: 'field.text',
                    data: { type: 'data.relative' }
                }
            },
            addedItems: {
                type: 'array',
                items: {
                    $ref: '#/definitions/view'
                },
                preventSuggest: true
            },
            minLength: {
                type: 'number',
                default: 0,
                preventSuggest: true
            },
            maxLength: {
                type: 'number',
                default: 0
            },
            editable: {
                type: 'boolean',
                default: true
            },
            removeVariant: {
                type: 'string',
                enum: ['default', 'group'],
                preventSuggest: true
            }
        },
        default: {
            type: 'field.list',
            buttonLabel: 'add more',
            data: {
                type: 'data.output',
                path: 'some.path'
            },
            render: {
                type: 'field.text',
                data: { type: 'data.relative' }
            }
        },
        required: ['render']
    }
});

export const getDataSchema = () => ({ type: 'array' });
