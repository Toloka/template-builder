import { Button, ButtonProps } from '@toloka-tb/common/components/Button';
import * as React from 'react';

import styles from './IconButton.less';

export const IconButton: React.FC<{ children: React.ReactNode } & ButtonProps> = ({ children, ...rest }) => (
    <Button {...rest}>
        <div className={styles.iconWrapper}>{children}</div>
    </Button>
);
