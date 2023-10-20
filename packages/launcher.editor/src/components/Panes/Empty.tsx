import * as React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Empty.less';

export const Empty = () => {
    const [t] = useTranslation();

    return <div className={styles.empty}>{t('selectTab')}</div>;
};
