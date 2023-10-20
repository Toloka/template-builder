import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.divider', {
    schema: {
        properties: {
            label: {
                type: 'string'
            }
        }
    }
});
