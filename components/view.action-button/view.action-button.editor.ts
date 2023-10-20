import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.action-button', {
    schema: {
        type: 'object',
        properties: {
            label: {
                type: 'string'
            },
            action: {
                $ref: '#/definitions/action'
            }
        },
        default: {
            type: 'view.action-button',
            label: 'Click me!',
            action: {
                type: 'action.set',
                payload: true,
                data: {
                    type: 'data.output',
                    path: 'path.in.dot.notation'
                }
            }
        }
    }
});
