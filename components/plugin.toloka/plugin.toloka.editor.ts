import { makePluginSchema } from '@toloka-tb/schemas/make';

export const schema = makePluginSchema('plugin.toloka', {
    schema: {
        properties: {
            notifications: {
                type: 'array',
                items: {
                    $ref: '#/definitions/view'
                },
                default: []
            },
            layout: {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                        enum: ['scroll', 'pager', 'first-task-only'],
                        docEnum: ['scroll', 'pager']
                    },
                    taskWidth: {
                        type: 'number',
                        default: 300,
                        docDefault: '100%'
                    }
                },
                required: ['kind'],
                default: {
                    kind: 'scroll',
                    taskWidth: 300
                }
            }
        },
        required: ['layout', 'type'],
        default: {
            type: 'plugin.toloka',
            layout: {
                kind: 'scroll',
                taskWidth: 300
            }
        }
    }
});
