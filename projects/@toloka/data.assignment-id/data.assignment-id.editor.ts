import { makeHelperSchema } from '@toloka-tb/schemas/make';

export const schema = makeHelperSchema('@toloka/data.assignment-id', {
    description: '',
    schema: {
        default: {
            type: '@toloka/data.assignment-id'
        }
    }
});
