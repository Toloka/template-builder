import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.if', {
    schema: {
        properties: {
            condition: {
                $ref: '#/definitions/condition'
            },
            then: {
                $ref: '#/definitions/any'
            },
            else: {
                $ref: '#/definitions/any'
            }
        },
        default: {
            type: 'helper.if',
            condition: {
                type: 'condition.equals',
                data: {
                    type: 'data.output',
                    path: 'path'
                },
                to: 15
            },
            then: true,
            else: undefined
        },
        required: ['type', 'condition', 'then']
    }
});
