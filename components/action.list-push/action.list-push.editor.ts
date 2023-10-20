export const schema = {
    type: 'object',
    title: 'action.list-push',
    properties: {
        type: {
            type: 'string',
            const: 'action.list-push',
            default: 'action.list-push'
        },
        data: {
            $ref: '#/definitions/dataRW',

            default: {
                type: 'data.output',
                path: 'some.path'
            }
        },
        payload: {
            $ref: '#/definitions/any',

            default: 'some_value'
        }
    },
    default: {
        type: 'action.list-push',
        data: {
            type: 'data.output',
            path: 'some.path'
        },
        payload: 'some_value'
    }
};
