import cx from 'classnames';
import { Spin } from '@toloka-tb/common/components/Spin';
import * as React from 'react';

import styles from './editor.pane.less';

export const Pane: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => {
    return <div className={cx(styles.pane, className)}>{children}</div>;
};

export const PaneTitle: React.FC<{ className?: string; loading?: boolean }> = ({ children, loading, className }) => {
    return (
        <div className={cx(styles.paneTitle, className)}>
            {children}
            {loading && <Spin className={styles.paneTitleSpin} size="xxs" />}
        </div>
    );
};

export const PaneContent: React.FC<{ className?: string }> = ({ children, className }) => {
    return <div className={cx(styles.paneContent, className)}>{children}</div>;
};

export const PaneFooter: React.FC<{ className?: string }> = ({ children, className }) => {
    return <div className={cx(styles.footer, className)}>{children}</div>;
};
