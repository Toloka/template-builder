import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.set-duration';

type ActionType = ViewAction<typeof type, number | null>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['view', 'payload'],
            apply: (action) => {
                if (action.payload === null) {
                    action.view.state.wasPlayed = false;
                }
                action.view.state.duration = action.payload || 0;
            }
        })
    };
};
