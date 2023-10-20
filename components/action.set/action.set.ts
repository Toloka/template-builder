import { Core, DataAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.set';

type ActionType = DataAction<typeof type, unknown, unknown, true>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['data', 'payload'],
            apply: (action) => (action.data.value = action.payload)
        })
    };
};
