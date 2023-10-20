export const listLayoutSchema = {
    type: 'object',
    properties: {
        direction: {
            type: 'string',
            enum: ['vertical', 'horizontal'],
            default: 'vertical'
        },
        size: {
            type: 'string',
            enum: ['s', 'm'],
            default: 'm'
        }
    },
    required: []
};
