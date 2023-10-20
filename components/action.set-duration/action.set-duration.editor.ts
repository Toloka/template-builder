export const schema = {
    type: 'object',
    title: 'action.set-duration',
    properties: {
        type: {
            type: 'string',
            const: 'action.set-duration',
            default: 'action.set-duration'
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
        type: 'action.set-duration',
        view: { $ref: 'view' },
        payload: 60
    }
};
