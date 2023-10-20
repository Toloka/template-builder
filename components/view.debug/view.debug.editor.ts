import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.debug', {
    schema: {
        type: 'object',
        properties: {
            insane: {
                type: 'boolean',
                default: false
            }
        },
        default: {
            type: 'view.debug',
            insane: false
        },
        required: []
    }
});
