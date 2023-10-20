import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.concat-arrays', {
    schema: {
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/definitions/data'
                },
                default: [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]
                ]
            }
        },
        default: {
            type: 'helper.concat-arrays',
            items: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]
        }
    }
});
