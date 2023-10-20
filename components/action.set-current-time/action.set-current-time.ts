import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.set-current-time';

type ActionType = ViewAction<typeof type, number>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['view', 'payload'],
            apply: (action) => {
                action.view.state.currentTime = action.payload;

                if (
                    action.view.state.currentTime >= action.view.state.duration &&
                    action.view.state.currentTime !== 0
                ) {
                    action.view.state.wasPlayedFully = true;
                }
            }
        })
    };
};
