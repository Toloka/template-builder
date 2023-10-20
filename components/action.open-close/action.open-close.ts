import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.open-close';

export type OpenCloseActionType = ViewAction<typeof type, boolean | undefined>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<OpenCloseActionType>({
            type,
            uses: ['view', 'payload'],
            apply: (action) => {
                // TODO: типы не импортятся из-за циклических зависимостей:
                // const store: PlayerStore | PlayerState = action.view.state;
                const store: any = action.view.state;

                if ('playerStoreVersion' in store) {
                    // Не поддерживается
                    return;
                }

                if (typeof action.payload === 'boolean') {
                    store.isOpen = action.payload;
                } else {
                    store.isOpen = !store.isOpen;
                }
            }
        })
    };
};
