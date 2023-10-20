import { create as createPlayPause } from '@toloka-tb/action.play-pause';
import { Core } from '@toloka-tb/core/coreComponentApi';
import { create as createMediaComponents } from '@toloka-tb/lib.media-view';
import { createUsePlayerStore } from '@toloka-tb/lib.player';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import translations from './i18n/view.audio.translations';
import styles from './view.audio.less';

const type = 'view.audio';

type Props = { url: string; loop?: boolean };

export const create = (core: Core) => {
    const usePlayerStore = createUsePlayerStore(core);
    const playPause = createPlayPause(core).compile;
    const { MediaError } = createMediaComponents(core);

    return {
        type,
        compile: core.helpers.view<Props>(
            type,
            observer(({ url, loop }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);
                const mediaRef = React.useRef<HTMLMediaElement | null>(null);
                const playerStore = usePlayerStore();

                const errorMessage = React.useMemo(() => {
                    switch (playerStore.error) {
                        case 'aborted':
                            return t('errorAborted');
                        case 'network':
                            return t('errorNetwork');
                        case 'decode':
                            return t('errorDecode');
                        case 'not-supported':
                            return t('errorNotAudio');
                        case 'unknown':
                            return t('errorUnknown');
                        default:
                            return undefined;
                    }
                }, [t, playerStore.error]);

                React.useEffect(() => {
                    const element = mediaRef.current;

                    if (!element) {
                        throw Error('No media after mount');
                    }

                    playerStore.init({ element, url });

                    return () => {
                        playerStore.dispose();
                    };
                }, [playerStore, url]);

                return (
                    <div className={styles.container}>
                        <MediaError error={errorMessage} url={url} compact={true} />
                        <core.ui.ActionHint action={playPause} className={styles.play} />
                        <audio
                            className={styles.player}
                            ref={mediaRef}
                            controls={true}
                            preload={'auto'}
                            loop={loop || false}
                        />
                    </div>
                );
            })
        )
    };
};

export { translations };
