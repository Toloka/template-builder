import { Spin as BaseSpin } from '@yandex/ui/Spin/desktop/bundle';
import React from 'react';

import styles from './spin.less';

export const Spin = () => <BaseSpin view="default" size="s" progress={true} className={styles.spin} />;
