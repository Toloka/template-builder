import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.length', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            }
        },
        default: {
            type: 'helper.length',
            data: '12345'
        }
    }
});
