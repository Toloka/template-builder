import { makeHelperSchema } from '@toloka-tb/schemas/make';

const keys = ['up', 'down'].concat('0123456789abcdefghijklmnopqrstuvwxyz'.split(''));

export const schema = makeHelperSchema('plugin.field.text-annotation.hotkeys', {
    schema: {
        properties: {
            labels: {
                type: 'array',
                description: '',
                items: {
                    type: 'string',
                    enum: keys
                },
                default: ['1', '2', '3', '4', '5']
            },
            remove: {
                type: 'string',
                description: '',
                default: 'c'
            }
        },
        required: ['type'],
        default: {
            type: 'plugin.field.text-annotation.hotkeys',
            labels: ['1', '2', '3', '4', '5'],
            remove: 'c'
        }
    }
});
