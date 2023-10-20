import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.set', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/dataRW'
            },
            payload: {
                $ref: '#/definitions/data'
            }
        },
        default: {
            type: 'action.set',
            data: {
                type: 'data.output',
                path: 'some.path'
            },
            payload: 'some_value'
        }
    }
});
