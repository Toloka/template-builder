import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.transform', {
    schema: {
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/definitions/any'
                },
                default: [{ name: 'Alice' }, { name: 'Bob' }]
            },
            into: {
                docType: 'any'
            } as any
        },
        default: {
            type: 'helper.transform',
            items: [{ name: 'Alice' }, { name: 'Bob' }],
            into: {
                type: 'data.local',
                path: 'item.name'
            }
        }
    }
});
