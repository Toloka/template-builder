import * as React from 'react';
import { useIntl } from 'react-intl';

import { key } from '../../editor.preview.intl';
import { MOBILE_WIDTH, MobileOrDesktop } from '../MobileDesktopRatdioButton/MobileDesktopRadioButton';
import styles from './LayoutPager.less';

type LayoutPagerProps = {
    taskWidth?: number | '100%';
    notifications: React.ReactNode;
    device?: MobileOrDesktop;
};

export const LayoutPager: React.FC<LayoutPagerProps> = ({ taskWidth, notifications, children, device }) => {
    const { formatMessage: t } = useIntl();

    const taskWidthMoreThanMobileWidth = typeof taskWidth !== 'number' || taskWidth > MOBILE_WIDTH;

    const maxWidth = taskWidthMoreThanMobileWidth && device === 'MOBILE' ? MOBILE_WIDTH : taskWidth;

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.task}
                style={{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }}
            >
                {Boolean(notifications) && <div className={styles.notifications}>{notifications}</div>}

                <div className={styles.taskContent}>
                    <div className={styles.borderContainer}>
                        <div className={styles.shadowContainer}>
                            <div className={styles.whiteContainer}>{children}</div>
                            <div
                                className={styles.paginationWrapper}
                                aria-label={t(key['preview.layout.pager.tooltip'])}
                                data-microtip-position="top"
                                role="tooltip"
                            >
                                <div className={styles.pagination}>
                                    {Array(10)
                                        .fill(0)
                                        .map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={styles.paginationButton}
                                                style={{ opacity: (10 - index) / 10 }}
                                                tabIndex={-1}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
