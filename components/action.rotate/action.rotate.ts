import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.rotate';

type ActionType = ViewAction<typeof type, 'left' | 'right'>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['view', 'payload'],
            apply: (action) => {
                if (action.payload === 'left') {
                    action.view.state.rotation -= 90;
                } else {
                    action.view.state.rotation += 90;
                }
            }
        })
    };
};
