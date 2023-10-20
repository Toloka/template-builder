import { Core, ViewAction } from '@toloka-tb/core/coreComponentApi';

const type = 'action.play-pause';

type ActionType = ViewAction<typeof type>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.action<ActionType>({
            type,
            uses: ['view'],
            apply: (action) => {
                // TODO: типы не импортятся из-за циклических зависимостей:
                // const store: PlayerStore | PlayerState = action.view.state;
                const store: any = action.view.state;

                if ('playerStoreVersion' in store) {
                    store.playPause();

                    return;
                }

                store.isPlaying = !store.isPlaying;
                if (store.isPlaying) {
                    store.wasPlayed = true;
                }

                if (store.currentTime === store.duration && store.isPlaying) {
                    store.currentTime = 0;
                }
            }
        })
    };
};
