import cx from 'classnames';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { key } from '../../editor.preview.intl';
import styles from './Errors.less';

export type Error = {
    message: string;
    getLocation: () => { line?: number; origin: 'input' | 'config' | 'intl' };
    onClick?: () => void;
};

export const Errors: React.FC<{ errors: Error[] }> = React.memo(({ errors }) => {
    const { formatMessage: t } = useIntl();

    return (
        <div className={cx(styles.errorContainer, errors.length > 0 && styles.errorContainerVisible)}>
            {errors.length > 0 && (
                <div>
                    <div className={styles.errorHeader}>
                        <div className={styles.errorPimple} />
                        <strong>{t(key['preview.unableToRender'])}</strong>
                    </div>
                    {errors.map((error, idx) => {
                        const location = error.getLocation();

                        return (
                            <div className={styles.error} key={idx}>
                                {location !== undefined && (
                                    <div
                                        className={cx(
                                            styles.errorLocation,
                                            !error.onClick && styles.errorLocationDisabled
                                        )}
                                        data-microtip-position="right"
                                        role={error.onClick ? 'tooltip' : undefined}
                                        aria-label={t(key['preview.goToError'])}
                                        onClick={error.onClick}
                                    >
                                        {location.line !== undefined
                                            ? t(key['preview.errorLocation'], {
                                                  line: location.line,
                                                  // TODO: remove `as keyof typeof` after TS 4.0+ updgrade
                                                  origin: t(key[`error.origin.${location.origin}` as keyof typeof key])
                                              })
                                            : t(key[`error.origin.${location.origin}` as keyof typeof key])}
                                    </div>
                                )}
                                <div className={styles.errorMessage}>{error.message}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

Errors.displayName = 'PreviewErrorOverlay';
