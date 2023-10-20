import { makeActionSchema } from '@toloka-tb/schemas/make';

export const schema = makeActionSchema('action.bulk', {
    schema: {
        properties: {
            payload: {
                type: 'array',
                items: {
                    $ref: '#/definitions/action'
                },
                default: [
                    {
                        type: 'action.notify',
                        payload: {
                            theme: 'info',
                            content: 'Action was triggered'
                        }
                    }
                ]
            }
        },
        default: {
            type: 'action.bulk',
            payload: [
                {
                    type: 'action.notify',
                    payload: {
                        theme: 'info',
                        content: 'Action 1 was triggered'
                    }
                },
                {
                    type: 'action.notify',
                    payload: {
                        theme: 'info',
                        content: 'Action 2 was triggered'
                    }
                }
            ]
        }
    }
});
