import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.object2entries', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            }
        },
        default: {
            type: 'helper.object2entries',
            data: {
                foo: 'hello',
                bar: 'world'
            }
        }
    }
});
