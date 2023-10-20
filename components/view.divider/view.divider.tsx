import { Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

import styles from './view.divider.less';

export const Divider: React.FC = ({ children }) =>
    children ? (
        <div className={styles.container}>
            <div className={styles.divider} />
            <div className={styles.text}>{children}</div>
            <div className={styles.divider} />
        </div>
    ) : (
        <div className={styles.divider} />
    );

const type = 'view.divider';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.view<{ label?: string; hint?: string }>(
            type,
            ({ label, hint }) => (
                <Divider>
                    {(hint || label) && (hint ? <core.ui.Hint hint={hint} label={label} /> : (label || '').toString())}
                </Divider>
            ),
            { showLabel: false, showHintInLabel: false }
        )
    };
};
