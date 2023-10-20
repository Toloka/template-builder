import { Alert } from '@toloka-tb/common/UI/Alert/Alert';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import styles from './Errors.less';

type ErrorObject = { message: string };

export const BlockErrors: React.FC<{ errors: ErrorObject[] | undefined; className?: string }> = observer(
    ({ errors, className }) => {
        if (!errors || errors.length === 0) {
            return null;
        }

        return (
            <div className={className}>
                {errors.map((error, idx) => (
                    <Alert theme="danger" key={idx} className={styles.error}>
                        {error.message}
                    </Alert>
                ))}
            </div>
        );
    }
);
