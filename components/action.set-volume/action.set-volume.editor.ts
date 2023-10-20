export const schema = {
    type: 'object',
    title: 'action.set-volume',
    properties: {
        type: {
            type: 'string',
            const: 'action.set-volume',
            default: 'action.set-volume'
        },
        view: {
            $ref: '#/definitions/ref'
        },
        payload: {
            type: 'number',
            default: 0
        }
    },
    default: {
        type: 'action.set-volume',
        view: { $ref: 'view' },
        payload: 1
    }
};
