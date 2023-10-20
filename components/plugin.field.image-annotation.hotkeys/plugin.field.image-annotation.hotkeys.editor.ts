import { makeHelperSchema } from '@toloka-tb/schemas/make';

const keys = ['up', 'down'].concat('0123456789abcdefghijklmnopqrstuvwxyz'.split(''));

export const schema = makeHelperSchema('plugin.field.image-annotation.hotkeys', {
    schema: {
        properties: {
            labels: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: keys
                },
                default: ['1', '2', '3', '4', '5']
            },
            modes: {
                type: 'object',
                properties: {
                    select: {
                        type: 'string',
                        default: 'q'
                    },
                    point: {
                        type: 'string',
                        default: 'w'
                    },
                    rectangle: {
                        type: 'string',
                        default: 'e'
                    },
                    polygon: {
                        type: 'string',
                        default: 'r'
                    }
                }
            },
            cancel: {
                type: 'string',
                default: 'z'
            },
            confirm: {
                type: 'string',
                default: 'x'
            }
        },
        required: ['type'],
        default: {
            type: 'plugin.field.image-annotation.hotkeys',
            labels: ['1', '2', '3', '4', '5'],
            modes: {
                select: 'q',
                point: 'w',
                rectangle: 'e',
                polygon: 'r'
            },
            confirm: 'a',
            cancel: 's'
        }
    }
});
