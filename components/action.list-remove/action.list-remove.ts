import { Core, DataAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.list-remove';

type ActionType = DataAction<typeof type, unknown[] | undefined, number, true>;

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

                for (let i = action.payload; i < action.data.value.length - 1; i++) {
                    action.data.value[i] = action.data.value[i + 1];
                }
                if (action.payload < action.data.value.length) {
                    action.data.value = action.data.value.slice(0, -1);
                }
                if (action.data.value.length === 0) {
                    action.data.value = undefined;
                }
            }
        })
    };
};
