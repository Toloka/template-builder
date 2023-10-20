import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { ValidationError } from '../ctx/form';
import styles from './Errors.less';

interface InlineErrorsProps {
    errors: ValidationError[];
    dir?: 'ltr' | 'rtl';
}

export const InlineErrors: React.FC<InlineErrorsProps> = observer(({ errors, dir }) => {
    if (!errors || errors.length === 0) {
        return null;
    }

    return (
        <ul className={styles.errorList} dir={dir}>
            {errors.map((error, idx) => (
                <li className={styles.errorListItem} key={idx}>
                    {error.message}
                </li>
            ))}
        </ul>
    );
});
