import { Alert } from '@toloka-tb/common/UI/Alert/Alert';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useIntl } from 'react-intl';
import ReactJSON from 'react-json-view';

import { key } from './editor.output.intl';
import styles from './editor.output.less';
import { createOutputStore, expire, OutputStore, setValue } from './editor.output.store';

const Info: React.FC<{ store: OutputStore }> = observer(({ store }) => {
    const { formatMessage: t } = useIntl();

    if (!store.value) {
        return <Alert theme="warning">{t(key['output.outdated'])}</Alert>;
    }

    if (Object.keys(store.value).length === 0) {
        return <Alert theme="warning">{t(key['output.empty'])}</Alert>;
    }

    return (
        <>
            {store.expired && (
                <Alert theme="warning" className={styles.warning}>
                    {t(key['output.outdated'])}
                </Alert>
            )}
            <ReactJSON src={store.value} name="output" displayDataTypes={false} />
        </>
    );
});

export const Output: React.FC<{ store: OutputStore }> = observer(({ store }) => {
    return (
        <div className={styles.content}>
            <Info store={store} />
        </div>
    );
});

export { createOutputStore, expire, OutputStore, setValue };
