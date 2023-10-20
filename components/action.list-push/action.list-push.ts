import { Core, DataAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.list-push';

type ActionType = DataAction<typeof type, unknown[], unknown, true>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['data', 'payload'],
            apply: (action) => {
                if (!Array.isArray(action.data.value)) {
                    action.data.value = [];
                }

                action.data.value = [...action.data.value, action.payload];
            }
        })
    };
};
