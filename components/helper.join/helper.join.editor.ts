import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.join', {
    schema: {
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/definitions/data',
                    type: 'string'
                },
                default: ['Foo', 'Bar', 'Baz']
            },
            by: {
                $ref: '#/definitions/data',
                default: ' '
            }
        },
        required: ['type', 'items'],
        default: {
            type: 'helper.join',
            items: ['Foo', 'Bar', 'Baz'],
            by: ''
        }
    }
});
