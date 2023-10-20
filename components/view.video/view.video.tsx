import { Core } from '@toloka-tb/core/coreComponentApi';
import {
    create as createMediaComponents,
    MediaLayoutProps,
    ScrollEnvApi,
    useLazyLoad
} from '@toloka-tb/lib.media-view';
import { createUsePlayerStore } from '@toloka-tb/lib.player';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import translations from './i18n/view.video.translations';
import styles from './view.video.less';

const type = 'view.video';

type Props = { url: string } & MediaLayoutProps;

export const create = (core: Core, options: { env: ScrollEnvApi }) => {
    const usePlayerStore = createUsePlayerStore(core);
    const { MediaError, MediaLayout } = createMediaComponents(core);

    return {
        type,
        compile: core.helpers.view<Props>(
            type,
            observer(({ url, ...restProps }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);
                const mediaRef = React.useRef<HTMLVideoElement | null>(null);
                const playerStore = usePlayerStore();
                const [mediaLayoutRef, shouldLoad] = useLazyLoad(options && options.env);

                const errorMessage = React.useMemo(() => {
                    switch (playerStore.error) {
                        case 'aborted':
                            return t('errorAborted');
                        case 'network':
                            return t('errorNetwork');
                        case 'decode':
                            return t('errorDecode');
                        case 'not-supported':
                            return t('errorNotVideo');
                        case 'unknown':
                            return t('errorUnknown');
                        default:
                            return undefined;
                    }
                }, [t, playerStore.error]);

                React.useEffect(() => {
                    const element = mediaRef.current;

                    if (!shouldLoad) {
                        return;
                    }

                    if (!element) {
                        throw Error('No media after mount');
                    }

                    playerStore.init({ element, url });

                    return () => {
                        playerStore.dispose();
                    };
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [mediaRef.current, shouldLoad, playerStore, url]);

                return (
                    <MediaLayout {...restProps} ref={mediaLayoutRef}>
                        <div className={styles.wrapper}>
                            <MediaError error={errorMessage} url={url} />
                            {shouldLoad && (
                                <video
                                    ref={mediaRef}
                                    className={styles.player}
                                    controls={true}
                                    controlsList="nodownload"
                                />
                            )}
                        </div>
                    </MediaLayout>
                );
            })
        )
    };
};

export { translations };
