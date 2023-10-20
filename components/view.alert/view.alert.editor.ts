import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.alert', {
    schema: {
        type: 'object',
        properties: {
            theme: {
                type: 'string',
                enum: ['info', 'success', 'warning', 'danger'],
                default: 'info'
            },
            content: {
                $ref: '#/definitions/view'
            }
        },
        default: {
            type: 'view.alert',
            theme: 'info',
            content: { type: 'view.text', content: 'Some information' }
        }
    }
});
