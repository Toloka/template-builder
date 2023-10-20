import cx from 'classnames';
import { CloseIcon } from '@toloka-tb/common/icons/crowd/Close';
import { InfoFilledIcon } from '@toloka-tb/common/icons/crowd/InfoFilled';
import React from 'react';

import styles from './Alert.less';

export const Alert: React.FC<{ className?: string; onClose: () => void }> = ({ children, className, onClose }) => {
    return (
        <div className={cx(styles.alert, className)}>
            <div className={styles.close} onClick={onClose}>
                <CloseIcon className={styles.closeIcon} />
            </div>
            <InfoFilledIcon className={styles.icon} />
            <div className={styles.content}>{children}</div>
        </div>
    );
};
