import { makePluginSchema } from '@toloka-tb/schemas/make';

export const schema = makePluginSchema('plugin.trigger', {
    schema: {
        properties: {
            onChangeOf: {
                $ref: '#/definitions/reactive'
            },
            condition: {
                $ref: '#/definitions/condition'
            },
            action: {
                $ref: '#/definitions/action'
            },
            fireImmediately: {
                type: 'boolean'
            }
        },
        default: {
            type: 'plugin.trigger',
            onChangeOf: {
                type: 'data.output',
                path: 'some.value'
            },
            action: {
                type: 'action.notify',
                payload: {
                    theme: 'info',
                    content: 'Trigger fired'
                }
            }
        }
    }
});
