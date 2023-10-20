import { Condition2Schema } from '@toloka-tb/component2schema';
import { makeConditionSchema } from '@toloka-tb/schemas/condition';

import { ConditionSchemaProps } from './condition.schema';

export const schema = makeConditionSchema('condition.schema', {
    schema: {
        properties: {
            data: {
                $ref: '#/definitions/data'
            },
            schema: {
                $ref: '#/definitions/any',
                docType: 'JSON Schema draft 7',
                docTypeUrl: 'https://json-schema.org/learn/getting-started-step-by-step.html'
            }
        },
        default: {
            type: 'condition.schema',
            schema: {
                type: 'string',
                minLength: 10,
                maxLength: 20
            }
        }
    }
});

export const condition2Schema: Condition2Schema<ConditionSchemaProps> = (props) => ({
    schema: typeof props.schema === 'boolean' ? props.schema : { ...props.schema },
    required: false
});
