export interface RTLProps {
    rtl?: {
        mode?: 'rtl' | 'ltr';
    };
}

export const rtlSchema = {
    type: 'object',
    properties: {
        mode: {
            type: 'string',
            enum: ['rtl', 'ltr'],
            default: 'ltr'
        }
    },
    required: []
};
