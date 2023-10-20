export const schema = {
    type: 'object',
    title: 'helper.multiply',
    properties: {
        type: {
            type: 'string',
            const: 'helper.multiply',
            default: 'helper.multiply'
        },
        items: {
            type: 'array',
            items: {
                type: 'number',
                default: 1,
                test: 'multiply'
            },
            default: [1, 2, 3]
        }
    },
    default: {
        type: 'helper.multiply',
        items: [1, 2, 3]
    }
} as const;
