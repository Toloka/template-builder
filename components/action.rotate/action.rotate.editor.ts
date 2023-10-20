import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.rotate', {
    schema: {
        properties: {
            type: {
                type: 'string',
                const: 'action.rotate',
                default: 'action.rotate'
            },
            view: {
                $ref: '#/definitions/ref'
            },
            payload: {
                type: 'string',
                enum: ['left', 'right']
            }
        },
        default: {
            type: 'action.rotate',
            view: { $ref: 'view' },
            payload: 'left'
        }
    }
});
