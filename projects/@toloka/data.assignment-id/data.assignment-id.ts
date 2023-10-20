import { Core } from '@toloka-tb/core/coreComponentApi';

const type = '@toloka/data.assignment-id';

export type TolokaAssignmentIdEnv = {
    getAssignmentId: () => string;
};

export const create = (core: Core, options: { env: TolokaAssignmentIdEnv }) => {
    return {
        type,
        compile: core.helpers.helper<{}, string>(() => {
            return options.env.getAssignmentId ? options.env.getAssignmentId() : '<assignment-id>';
        })
    };
};
