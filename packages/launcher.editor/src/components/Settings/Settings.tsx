import { IconHorizontalDots } from '@toloka-tb/common/icons/horizontalDots';
import { Popover } from '@toloka-tb/common/components/Popover';
import { Select } from '@toloka-tb/common/components/Select';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { availableLocales } from '../../i18n/availableLocales';
import { appStore, EditorAppLocale } from '../../store/appStore';
import { IconButton } from '../UI/IconButton/IconButton';
import styles from './Settings.less';

const availableHotkeys = [
    {
        value: '',
        label: '–'
    },
    {
        value: 'Tab',
        label: 'Tab'
    },
    {
        value: 'Enter',
        label: 'Enter'
    },
    {
        value: 'Alt',
        label: 'Alt'
    },
    {
        value: 'Escape',
        label: 'Escape'
    },
    {
        value: 'Space',
        label: 'Space'
    },
    {
        value: 'LeftArrow',
        label: '←'
    },
    {
        value: 'UpArrow',
        label: '↑'
    },
    {
        value: 'RightArrow',
        label: '→'
    },
    {
        value: 'DownArrow',
        label: '↓'
    },
    {
        value: 'CtrlCmd+KEY_0',
        label: 'Ctrl+0'
    },
    {
        value: 'CtrlCmd+KEY_1',
        label: 'Ctrl+1'
    },
    {
        value: 'CtrlCmd+KEY_2',
        label: 'Ctrl+2'
    },
    {
        value: 'CtrlCmd+KEY_3',
        label: 'Ctrl+3'
    },
    {
        value: 'CtrlCmd+KEY_4',
        label: 'Ctrl+4'
    },
    {
        value: 'CtrlCmd+KEY_5',
        label: 'Ctrl+5'
    },
    {
        value: 'CtrlCmd+KEY_6',
        label: 'Ctrl+6'
    },
    {
        value: 'CtrlCmd+KEY_7',
        label: 'Ctrl+7'
    },
    {
        value: 'CtrlCmd+KEY_8',
        label: 'Ctrl+8'
    },
    {
        value: 'CtrlCmd+KEY_9',
        label: 'Ctrl+9'
    },
    {
        value: 'CtrlCmd+KEY_A',
        label: 'Ctrl+A'
    },
    {
        value: 'CtrlCmd+KEY_B',
        label: 'Ctrl+B'
    },
    {
        value: 'CtrlCmd+KEY_C',
        label: 'Ctrl+C'
    },
    {
        value: 'CtrlCmd+KEY_D',
        label: 'Ctrl+D'
    },
    {
        value: 'CtrlCmd+KEY_E',
        label: 'Ctrl+E'
    },
    {
        value: 'CtrlCmd+KEY_F',
        label: 'Ctrl+F'
    },
    {
        value: 'CtrlCmd+KEY_G',
        label: 'Ctrl+G'
    },
    {
        value: 'CtrlCmd+KEY_H',
        label: 'Ctrl+H'
    },
    {
        value: 'CtrlCmd+KEY_I',
        label: 'Ctrl+I'
    },
    {
        value: 'CtrlCmd+KEY_J',
        label: 'Ctrl+J'
    },
    {
        value: 'CtrlCmd+KEY_K',
        label: 'Ctrl+K'
    },
    {
        value: 'CtrlCmd+KEY_L',
        label: 'Ctrl+L'
    },
    {
        value: 'CtrlCmd+KEY_M',
        label: 'Ctrl+M'
    },
    {
        value: 'CtrlCmd+KEY_N',
        label: 'Ctrl+N'
    },
    {
        value: 'CtrlCmd+KEY_O',
        label: 'Ctrl+O'
    },
    {
        value: 'CtrlCmd+KEY_P',
        label: 'Ctrl+P'
    },
    {
        value: 'CtrlCmd+KEY_Q',
        label: 'Ctrl+Q'
    },
    {
        value: 'CtrlCmd+KEY_R',
        label: 'Ctrl+R'
    },
    {
        value: 'CtrlCmd+KEY_S',
        label: 'Ctrl+S'
    },
    {
        value: 'CtrlCmd+KEY_T',
        label: 'Ctrl+T'
    },
    {
        value: 'CtrlCmd+KEY_U',
        label: 'Ctrl+U'
    },
    {
        value: 'CtrlCmd+KEY_V',
        label: 'Ctrl+V'
    },
    {
        value: 'CtrlCmd+KEY_W',
        label: 'Ctrl+W'
    },
    {
        value: 'CtrlCmd+KEY_X',
        label: 'Ctrl+X'
    },
    {
        value: 'CtrlCmd+KEY_Y',
        label: 'Ctrl+Y'
    },
    {
        value: 'CtrlCmd+KEY_Z',
        label: 'Ctrl+Z'
    },
    {
        value: 'F1',
        label: 'F1'
    },
    {
        value: 'F2',
        label: 'F2'
    },
    {
        value: 'F3',
        label: 'F3'
    },
    {
        value: 'F4',
        label: 'F4'
    },
    {
        value: 'F5',
        label: 'F5'
    },
    {
        value: 'F6',
        label: 'F6'
    },
    {
        value: 'F7',
        label: 'F7'
    },
    {
        value: 'F8',
        label: 'F8'
    },
    {
        value: 'F9',
        label: 'F9'
    },
    {
        value: 'F10',
        label: 'F10'
    },
    {
        value: 'F11',
        label: 'F11'
    },
    {
        value: 'F12',
        label: 'F12'
    }
];

export const Settings: React.FC<{ pin: 'brick-round' | 'brick-clear' }> = observer(({ pin }) => {
    const [t, i18n] = useTranslation();

    return (
        <Popover
            visible={appStore.modalIsOpen.settings}
            onRequestClose={() => (appStore.modalIsOpen.settings = false)}
            onRequestOpen={() => (appStore.modalIsOpen.settings = true)}
            content={
                <>
                    <h3 className={styles.title}>{t('settings.title')}</h3>
                    <div className={styles.row}>
                        <Select
                            size="s"
                            onChange={(e) => (appStore.settings.formatHotkey = e.target.value)}
                            value={appStore.settings.formatHotkey}
                            options={availableHotkeys.map((option) => ({ value: option.value, content: option.label }))}
                        />
                        <span className={styles.label}>{t('settings.format')}</span>
                    </div>
                    <div className={styles.row}>
                        <Select
                            size="s"
                            onChange={(e) => (appStore.settings.autocompleteHotkey = e.target.value)}
                            value={appStore.settings.autocompleteHotkey}
                            options={availableHotkeys.map((option) => ({ value: option.value, content: option.label }))}
                        />
                        <span className={styles.label}>{t('settings.autocomplete')}</span>
                    </div>
                    <div className={styles.row}>
                        <Select
                            size="s"
                            onChange={(e) => (appStore.locale = e.target.value as EditorAppLocale)}
                            value={i18n.language}
                            options={availableLocales.map((locale) => ({
                                value: locale,
                                content: t(`settings.locales.${locale}`)
                            }))}
                        />
                        <span className={styles.label}>{t('settings.locale')}</span>
                    </div>
                </>
            }
        >
            <IconButton checked={false} size="s" pin={pin}>
                <IconHorizontalDots />
            </IconButton>
        </Popover>
    );
});
