import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('helper.text-transform', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data',
                default: {
                    type: 'data.input',
                    path: 'path'
                }
            },
            transformation: {
                type: 'string',
                default: 'uppercase',
                enum: ['uppercase', 'lowercase', 'capitalize']
            }
        },
        required: ['data', 'transformation'],
        default: {
            type: 'helper.text-transform',
            data: {
                type: 'data.input',
                path: 'path'
            },
            transformation: 'uppercase'
        }
    }
});
