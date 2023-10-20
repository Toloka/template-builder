import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.toggle', {
    schema: {
        type: 'object',
        title: 'action.toggle',
        properties: {
            data: {
                $ref: '#/definitions/dataRW'
            }
        },
        default: {
            type: 'action.toggle',
            data: {
                type: 'data.output',
                path: 'some.path'
            }
        }
    }
});
