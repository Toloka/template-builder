import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.entries2object', {
    schema: {
        properties: {
            entries: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string'
                        },
                        value: {
                            $ref: '#/definitions/data'
                        }
                    },
                    required: ['key', 'value']
                },
                default: [
                    {
                        key: 'foo',
                        value: 'hello'
                    },
                    {
                        key: 'bar',
                        value: 'world'
                    }
                ]
            }
        },
        default: {
            type: 'helper.entries2object',
            entries: [
                {
                    key: 'foo',
                    value: 'hello'
                },
                {
                    key: 'bar',
                    value: 'world'
                }
            ]
        }
    }
});
