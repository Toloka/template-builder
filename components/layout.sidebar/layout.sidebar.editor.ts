import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('layout.sidebar', {
    label: false,
    hint: false,
    schema: {
        type: 'object',
        properties: {
            content: {
                $ref: '#/definitions/view'
            },
            minWidth: {
                type: 'number',
                default: 400
            },
            controls: {
                $ref: '#/definitions/view'
            },
            controlsWidth: {
                type: 'number',
                default: 200
            },
            extraControls: {
                $ref: '#/definitions/view'
            }
        },
        required: ['type', 'content', 'controls'],
        default: {
            type: 'layout.sidebar',
            content: {
                type: 'view.image',
                fullHeight: true,
                url: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/small.png'
            },
            controls: {
                type: 'view.alert',
                theme: 'info',
                content: {
                    type: 'view.text',
                    content: 'Side controls'
                }
            }
        }
    }
});
