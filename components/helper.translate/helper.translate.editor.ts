import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('helper.translate', {
    description: 'Enables you to translate text into different langauges',
    schema: {
        properties: {
            key: {
                type: 'string',
                default: 'key',
                pattern: '^[a-z][a-z0-9-]*$',
                patternHint:
                    'A key must start with lowercase letter [a-z] and can only include lowercase letters [a-z], numbers [0-9], and dash sign "-"',
                $tbTrait: 'string-static'
            }
        },
        required: ['type', 'key'],
        default: {
            type: 'helper.translate',
            key: 'key'
        }
    }
});
