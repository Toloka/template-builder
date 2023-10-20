export const mediaLayoutSchema = {
    type: 'object',
    properties: {
        ratio: {
            type: 'array',
            maxItems: 2,
            minItems: 2,
            items: {
                type: 'number',
                default: 1
            },
            default: [16, 9]
        },
        maxWidth: {
            type: 'number',
            default: 0,
            docDefault: ''
        },
        minWidth: {
            type: 'number',
            default: 150
        },
        fullHeight: {
            type: 'boolean'
        }
    },
    required: []
};
