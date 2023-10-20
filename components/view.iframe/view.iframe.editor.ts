import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.iframe', {
    mediaLayoutProps: true,
    schema: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                default: 'https://example.com/'
            }
        },
        default: {
            type: 'view.iframe',
            url: 'https://example.com/'
        },
        required: ['url']
    }
});
