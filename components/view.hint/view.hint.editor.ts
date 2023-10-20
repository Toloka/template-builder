import { makeViewSchema } from '@toloka-tb/schemas/view';

export const schema = makeViewSchema('view.hint', {
    schema: {
        type: 'object',
        properties: {
            hint: {
                type: 'string',
                default: 'Lorem ipsum'
            }
        },
        default: {
            type: 'view.hint',
            label: 'Lorem ipsum',
            hint: 'Dolor sit amet'
        }
    }
});
