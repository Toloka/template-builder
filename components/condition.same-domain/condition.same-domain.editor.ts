import { makeConditionSchema } from '@toloka-tb/schemas/condition';

export const schema = makeConditionSchema('condition.same-domain', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            },
            original: {
                $ref: '#/definitions/data'
            }
        },
        required: ['original'],
        default: {
            type: 'condition.same-domain',
            original: 'https://toloka.ai'
        }
    }
});

export const condition2Schema = () => {
    return {
        schema: { type: 'string' }
    };
};
