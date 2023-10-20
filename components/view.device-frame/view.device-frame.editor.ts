import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.device-frame', {
    mediaLayoutProps: true,
    schema: {
        type: 'object',
        properties: {
            content: {
                $ref: '#/definitions/view'
            }
        },
        default: {
            type: 'view.device-frame',
            maxWidth: 300,
            content: {
                type: 'view.image',
                noBorder: true,
                fullHeight: true,
                scrollable: true,
                url:
                    'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/wikipedia-screenshot.png'
            }
        }
    }
});
