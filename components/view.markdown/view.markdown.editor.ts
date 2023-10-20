import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.markdown', {
    schema: {
        type: 'object',
        properties: {
            content: {
                type: 'string',
                default: ''
            }
        },
        default: {
            type: 'view.markdown',
            content: '**Hello** _world_'
        }
    }
});
