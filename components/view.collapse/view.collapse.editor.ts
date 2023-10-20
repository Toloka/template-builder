import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.collapse', {
    schema: {
        type: 'object',
        properties: {
            label: {
                type: 'string',
                default: ''
            },
            content: {
                $ref: '#/definitions/view'
            },
            defaultOpened: {
                type: 'boolean',
                default: false
            }
        },
        default: {
            type: 'view.collapse',
            label: 'Collapse header',
            content: { type: 'view.text', content: 'Hidden text' }
        },
        required: ['label', 'content']
    }
});
