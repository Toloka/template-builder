import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.zoom-in-out';

type ActionType = ViewAction<typeof type>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['view'],
            apply: (action) => {
                action.view.state.zoomed = !action.view.state.zoomed;
            }
        })
    };
};
