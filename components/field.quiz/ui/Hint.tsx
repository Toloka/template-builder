import cn from 'classnames';
import * as React from 'react';

import styles from './Hint.less';

type HintProps = {
    text: React.ReactNode;
    type: 'success' | 'error';
};

export const Hint: React.FC<HintProps> = ({ text, type }) => {
    return (
        <div className={cn(styles.hint, [type === 'success' && styles.success, type === 'error' && styles.error])}>
            {text}
        </div>
    );
};
