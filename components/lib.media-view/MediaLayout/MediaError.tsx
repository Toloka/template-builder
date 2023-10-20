import { Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import translations from '../i18n/lib.media-view.translations';
import styles from './MediaError.less';

export type MediaErrorProps = { type?: string; url: string; error?: string; compact?: boolean };

export const createMediaError = (core: Core): React.FC<MediaErrorProps> => (props) => {
    const t = core.i18n.useTranslation<keyof typeof translations.ru>('lib.media-view');

    return props.error ? (
        <div className={cx(styles.error, props.compact && styles.errorCompact)}>
            {!props.compact && <h4 className={cx('h4', styles.errorTitle)}>{t('failedToLaunch')}</h4>}
            <div>{t('error', { error: props.error })}</div>

            {!props.compact ? (
                <div className={cx(styles.errorUrlBlock, props.compact && styles.errorUrlBlockCompact)}>
                    {t('url', {
                        url: (
                            <a href={props.url} className={styles.errorUrl} target="_blank" rel="noopener noreferrer">
                                {props.url}
                            </a>
                        )
                    })}
                </div>
            ) : (
                <a href={props.url} className={styles.errorUrl} target="_blank" rel="noopener noreferrer">
                    {t('newTab')}
                </a>
            )}
        </div>
    ) : null;
};
