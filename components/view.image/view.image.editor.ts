import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.image', {
    mediaLayoutProps: true,
    schema: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                default: ''
            },
            popup: {
                type: 'boolean',
                default: true
            },
            scrollable: {
                type: 'boolean',
                default: true,
                docDefault: false
            },
            rotatable: {
                type: 'boolean',
                default: true,
                docDefault: false
            },
            noBorder: {
                type: 'boolean',
                default: false,
                docDefault: true
            },
            noLazyLoad: {
                type: 'boolean',
                default: false
            }
        },
        default: {
            type: 'view.image',
            url: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/small.png'
        },
        required: ['url']
    }
});
