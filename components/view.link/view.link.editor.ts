import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.link', {
    schema: {
        type: 'object',
        title: 'view.link',
        properties: {
            url: {
                type: 'string',
                default: ''
            },
            content: {
                type: 'string'
            }
        },
        default: {
            type: 'view.link',
            url: 'https://google.com',
            content: 'Link',
            validation: {
                type: 'condition.link-opened',
                url: 'https://google.com'
            }
        },
        required: ['url']
    }
});
