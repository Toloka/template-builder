import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.open-link', {
    schema: {
        properties: {
            payload: {
                type: 'string',
                default: ''
            }
        },
        default: {
            type: 'action.open-link',
            payload: 'https://toloka.ai'
        }
    }
});
