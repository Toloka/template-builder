export const schema = {
    type: 'object',
    title: 'helper.sum',
    properties: {
        type: {
            type: 'string',
            const: 'helper.sum',
            default: 'helper.sum'
        },
        items: {
            type: 'array',
            items: {
                type: 'number',
                default: 0,
                test: 'sum'
            },
            default: [1, 2, 3]
        }
    },
    default: {
        type: 'helper.sum',
        items: [1, 2, 3]
    }
} as const;
