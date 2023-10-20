import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.notify', {
    schema: {
        properties: {
            payload: {
                type: 'object',
                properties: {
                    content: {
                        type: 'string',
                        default: ''
                    },
                    theme: {
                        type: 'string',
                        enum: ['info', 'success', 'warning', 'danger'],
                        default: 'info'
                    },
                    delay: {
                        type: 'number',
                        default: 0
                    },
                    duration: {
                        type: 'number',
                        default: 4500
                    }
                },
                default: {
                    theme: 'info',
                    content: 'Lorem ipsum'
                },
                required: ['content', 'theme']
            }
        },
        required: ['type', 'payload'],
        default: {
            type: 'action.notify',
            payload: {
                theme: 'info',
                content: 'Hello there!'
            }
        }
    }
});
