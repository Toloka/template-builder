import React from 'react';

import styles from './Label.less';

type LabelProps = {
    label?: string;
    requiredMark?: boolean;
};

export const Label: React.FC<LabelProps> = ({ label = '', requiredMark = false }) => {
    return (
        <div className={styles.label}>
            {label} {requiredMark && <span className={styles.requiredMark}>*</span>}
        </div>
    );
};
