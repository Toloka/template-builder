import cx from 'classnames';
import * as React from 'react';

import styles from './Alert.less';

export type AlertProps = {
    theme: 'success' | 'info' | 'warning' | 'danger';
    className?: string;
};

export const Alert: React.FC<AlertProps> = ({ children, theme, className }) => (
    <div className={cx(styles.alertBox, styles[theme], className)}>{children}</div>
);
