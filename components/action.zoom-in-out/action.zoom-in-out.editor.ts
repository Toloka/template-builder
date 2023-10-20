export const schema = {
    type: 'object',
    title: 'action.zoom-in-out',
    properties: {
        type: {
            type: 'string',
            const: 'action.zoom-in-out',
            default: 'action.zoom-in-out'
        },
        view: {
            $ref: '#/definitions/ref',
            docType: 'ref'
        }
    },
    default: {
        type: 'action.zoom-in-out',
        view: { $ref: 'view' }
    }
};
