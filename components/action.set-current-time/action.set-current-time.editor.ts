export const schema = {
    type: 'object',
    title: 'action.set-current-time',
    properties: {
        type: {
            type: 'string',
            const: 'action.set-current-time',
            default: 'action.set-current-time'
        },
        view: {
            $ref: '#/definitions/ref'
        },
        payload: {
            anyOf: [
                {
                    type: 'string',
                    default: '00:00'
                },
                {
                    type: 'number',
                    default: 0
                }
            ]
        }
    },
    default: {
        type: 'action.set-current-time',
        view: { $ref: 'view' },
        payload: '13:30'
    }
};
