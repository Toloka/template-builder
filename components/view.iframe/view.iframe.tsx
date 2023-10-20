import { Core } from '@toloka-tb/core/coreComponentApi';
import {
    create as createMediaComponents,
    MediaLayoutProps,
    ScrollEnvApi,
    useLazyLoad
} from '@toloka-tb/lib.media-view';
import * as React from 'react';

import translations from './i18n/view.iframe.translations';
import styles from './view.iframe.less';

const type = 'view.iframe';

export type IframeProps = {
    url: string;
} & MediaLayoutProps;

export const create = (core: Core, options: { env: ScrollEnvApi; extendProps?: { youshallnotpass: 'true' } }) => {
    const { MediaError, MediaLayout } = createMediaComponents(core);

    return {
        type,
        compile: core.helpers.view<IframeProps>(type, ({ url, ...restProps }) => {
            const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);
            const urlError = React.useMemo(() => {
                if (!url) {
                    return t('errorNoUrl');
                } else if (!url.startsWith(location.protocol)) {
                    // https://stackoverflow.com/questions/30646417/catching-mixed-content-error
                    return t('errorProtocol', { protocol: location.protocol });
                }
            }, [url, t]);

            // we do not want to lose iframe state if possible i think, especially if pager type task was just scrolled down
            const [mediaLayoutRef, wasInView] = useLazyLoad(options && options.env);

            return (
                <MediaLayout {...restProps} ref={mediaLayoutRef}>
                    <MediaError error={urlError} url={url} />
                    {wasInView && (
                        <iframe
                            src={url}
                            className={styles.iframe}
                            referrerPolicy="no-referrer"
                            {...options.extendProps}
                        />
                        // we can't proper error, when X-FRAME-OPTIONS is "deny" due to Same Origin policy purposefully hiding it
                    )}
                </MediaLayout>
            );
        })
    };
};

export { translations };
