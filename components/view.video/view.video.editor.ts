import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.video', {
    mediaLayoutProps: true,
    schema: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                default: ''
            },
            ratio: {
                type: 'array'
            }
        },
        default: {
            type: 'view.video',
            url: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/small.mp4',
            validation: {
                type: 'condition.played'
            }
        },
        required: ['url']
    }
});
