import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.audio', {
    schema: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                default: ''
            },
            loop: {
                type: 'boolean',
                default: true,
                docDefault: false
            }
        },
        required: ['url'],
        default: {
            type: 'view.audio',
            url: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/file-examples/small.mp3',
            validation: {
                type: 'condition.played'
            }
        }
    }
});
