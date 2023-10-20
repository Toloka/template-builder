import * as React from 'react';

import { MOBILE_WIDTH, MobileOrDesktop } from '../MobileDesktopRatdioButton/MobileDesktopRadioButton';
import styles from './LayoutBlank.less';

type LayoutBlankProps = {
    device?: MobileOrDesktop;
};

export const LayoutBlank: React.FC<LayoutBlankProps> = ({ children, device }) => {
    const maxWidth = device === 'MOBILE' ? MOBILE_WIDTH : 'none';

    return (
        <div className={styles.container}>
            <div className={styles.borderContainer} style={{ maxWidth }}>
                <div className={styles.whiteContainer}>{children}</div>
            </div>
        </div>
    );
};
