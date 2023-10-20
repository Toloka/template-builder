import { ContextualAction, Core } from '@toloka-tb/core/coreComponentApi';

const type = 'action.open-link';

type ActionType = ContextualAction<typeof type, string>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['payload', 'ctxBag'],
            apply: (action) => {
                if (!action.ctxBag) return;

                core.externalLinks.open(action.ctxBag, action.payload);
            }
        })
    };
};
