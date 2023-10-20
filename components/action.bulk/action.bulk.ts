import { ContextualAction, Core, GettableAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.bulk';

type ActionType = ContextualAction<typeof type, GettableAction[], unknown>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['payload', 'ctxBag'],
            apply: (action) => {
                if (!Array.isArray(action.payload)) return;
                if (!action.ctxBag) return;

                for (const subAction of action.payload) {
                    action.ctxBag.tb.dispatch(subAction, action.ctxBag);
                }
            }
        })
    };
};
