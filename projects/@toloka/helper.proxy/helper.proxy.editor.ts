import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('@toloka/helper.proxy', {
    schema: {
        properties: {
            path: {
                type: 'string'
            }
        },
        required: ['path'],
        default: {
            type: '@toloka/helper.proxy',
            path: '/my-proxy/example.jpg'
        }
    }
});
