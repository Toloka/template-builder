import { TextInput } from '@toloka-tb/common/components/TextInput';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { editorI18n } from '../../i18n/editorI18n';
import { closeStep4Hint, intlStore } from '../../store/intlStore';
import { Alert } from '../Alert/Alert';
import styles from './Intl.less';

const Input: React.FC<{ translationKey: string; locale: string }> = observer(({ translationKey, locale }) => {
    const lang = intlStore.translations[locale];

    return (
        <div className={styles.input}>
            &quot;{String(translationKey || '')}&quot;
            <TextInput
                value={lang[translationKey] || ''}
                onChange={(e) => (lang[translationKey] = e.target.value)}
                hasClear={true}
            />
        </div>
    );
});

export const Intl: React.FC = observer(() => {
    const [t] = useTranslation('launcher.editor', { i18n: editorI18n });

    return (
        <div className={styles.intl}>
            {intlStore.showStep4Hint && (
                <Alert className={styles.hint} onClose={closeStep4Hint}>
                    {t('initialLaungageTranslations.explanation')}
                </Alert>
            )}
            {intlStore.keys.map((x) => (
                <Input translationKey={x.key} key={x.key} locale={intlStore.defaultLocale} />
            ))}
        </div>
    );
});
