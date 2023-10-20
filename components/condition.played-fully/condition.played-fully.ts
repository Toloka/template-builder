import { Core } from '@toloka-tb/core/coreComponentApi';
import { PlayerState, PlayerStore } from '@toloka-tb/lib.player';

import translations from './i18n/condition.played-fully.translations';

export type ConditionFinishedProps = {
    viewState?: PlayerState | PlayerStore;
};

const type = 'condition.played-fully';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.conditionV2<ConditionFinishedProps, keyof typeof translations.ru>(
            type,
            (props) => {
                const store = props?.viewState;

                if (!store) {
                    return false;
                }

                if ('playerStoreVersion' in store) {
                    return Boolean(store.playedFully || store.error); // there is no way to played error media
                }

                return Boolean(
                    store.wasPlayedFully || store.status.state === 'error' // there is no way to played error media
                );
            },
            (t) => ({
                direct: () => ({ message: t('shouldPlay') }),
                opposite: () => ({ message: t('shouldNotPlay') })
            })
        )
    };
};

export { translations };
