import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.open-close', {
    schema: {
        type: 'object',
        title: 'action.open-close',
        properties: {
            type: {
                type: 'string',
                const: 'action.open-close',
                default: 'action.open-close'
            },
            view: {
                $ref: '#/definitions/ref'
            }
        },
        default: {
            type: 'action.open-close',
            view: { $ref: 'view' }
        }
    }
});
