import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.play-pause', {
    schema: {
        properties: {
            view: {
                $ref: '#/definitions/ref'
            }
        },
        default: {
            type: 'action.play-pause',
            view: { $ref: 'view' }
        }
    }
});
