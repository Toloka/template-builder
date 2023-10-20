import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('layout.bars', {
    label: false,
    hint: false,
    schema: {
        type: 'object',
        properties: {
            content: {
                $ref: '#/definitions/view'
            },
            barBefore: {
                $ref: '#/definitions/view'
            },
            barAfter: {
                $ref: '#/definitions/view'
            }
        },
        required: ['content'],
        default: {
            type: 'layout.bars',
            content: {
                type: 'view.image',
                url: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/small.png'
            },
            barBefore: {
                type: 'view.alert',
                theme: 'info',
                content: {
                    type: 'view.text',
                    content: 'Bar Before'
                }
            },
            barAfter: {
                type: 'view.alert',
                theme: 'warning',
                content: {
                    type: 'view.text',
                    content: 'Bar After'
                }
            }
        }
    }
});
