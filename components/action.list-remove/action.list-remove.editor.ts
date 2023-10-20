export const schema = {
    type: 'object',
    title: 'action.list-remove',
    properties: {
        type: {
            type: 'string',
            const: 'action.list-remove',
            default: 'action.list-remove'
        },
        data: {
            $ref: '#/definitions/dataRW',

            default: {
                type: 'data.output',
                path: 'some.path'
            }
        },
        payload: {
            type: 'number',
            minimum: 0
        }
    },
    default: {
        type: 'action.list-remove',
        data: {
            type: 'data.output',
            path: 'some.path'
        },
        payload: 3
    }
};
