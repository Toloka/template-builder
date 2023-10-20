import { Core, DataAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.toggle';

type ActionType = DataAction<typeof type, boolean | undefined>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['data'],
            apply: (action) => {
                if (action.data.value) {
                    action.data.value = undefined;
                } else {
                    action.data.value = true;
                }
            }
        })
    };
};
