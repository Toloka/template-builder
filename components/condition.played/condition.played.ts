import { Core } from '@toloka-tb/core/coreComponentApi';
import { PlayerState, PlayerStore } from '@toloka-tb/lib.player';

import translations from './i18n/condition.played.translations';

export type ConditionPlayedProps = {
    viewState?: PlayerState | PlayerStore;
};

const type = 'condition.played';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.conditionV2<ConditionPlayedProps, keyof typeof translations.ru>(
            type,
            (props) => {
                const store = props?.viewState;

                if (!store) {
                    return false;
                }

                if ('playerStoreVersion' in store) {
                    return Boolean(store.played || store.error); // there is no way to played error media
                }

                return Boolean(
                    store.wasPlayed || store.status.state === 'error' // there is no way to played error media
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
