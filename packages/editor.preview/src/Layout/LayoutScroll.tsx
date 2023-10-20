import * as React from 'react';

import { MOBILE_WIDTH, MobileOrDesktop } from '../MobileDesktopRatdioButton/MobileDesktopRadioButton';
import styles from './LayoutScroll.less';

type LayoutScrollProps = {
    taskWidth?: number | '100%';
    notifications: React.ReactNode;
    device?: MobileOrDesktop;
};

export const LayoutScroll: React.FC<LayoutScrollProps> = ({ taskWidth, notifications, children, device }) => {
    const taskWidthMoreThanMobileWidth = typeof taskWidth !== 'number' || taskWidth > MOBILE_WIDTH;

    const maxWidth = taskWidthMoreThanMobileWidth && device === 'MOBILE' ? MOBILE_WIDTH : taskWidth;

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.taskList}
                style={{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }}
            >
                {Boolean(notifications) && <div className={styles.notifications}>{notifications}</div>}

                <div className={styles.task}>
                    <div className={styles.taskContent}>{children}</div>
                </div>
            </div>
        </div>
    );
};
