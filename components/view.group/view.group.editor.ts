import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.group', {
    schema: {
        type: 'object',
        properties: {
            label: {
                type: 'string'
            },
            hint: {
                type: 'string'
            },
            content: {
                $ref: '#/definitions/view'
            }
        },
        default: {
            type: 'view.group',
            label: 'Group title',
            content: {
                type: 'view.list',
                items: [
                    {
                        type: 'view.text',
                        content: 'text'
                    },
                    {
                        type: 'field.checkbox',
                        label: 'Label',
                        data: {
                            type: 'data.output',
                            path: 'path'
                        }
                    }
                ]
            }
        }
    }
});
