import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.set-volume';

type ActionType = ViewAction<typeof type, number>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['view', 'payload'],
            apply: (action) => {
                action.view.state.volume = action.payload;
            }
        })
    };
};
