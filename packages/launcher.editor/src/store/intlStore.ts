import { compileConfig, createLock } from '@toloka-tb/bootstrap';
import { CompilationHook, Translations } from '@toloka-tb/bootstrap/domain';
import { Error } from '@toloka-tb/editor.preview';
import { observable, reaction } from 'mobx';

import { editorI18n } from '../i18n/editorI18n';
import { configStore } from './configStore';
import { defaultIntlState } from './defaults';

export type IntlStore = {
    defaultLocale: string;
    translations: Translations;
    keys: Array<{ key: string }>;

    showStep4Hint?: boolean;
    errors: Error[];
};

export const intlStore: IntlStore = observable({
    ...defaultIntlState(),
    get errors() {
        const emptyKeys = intlStore.keys
            .map(({ key }) => key)
            .filter((key) => {
                if (!intlStore.translations[intlStore.defaultLocale]) {
                    intlStore.translations[intlStore.defaultLocale] = {};
                }

                const value = intlStore.translations[intlStore.defaultLocale][key];

                return !value || value.trim().length === 0;
            });

        if (emptyKeys.length === 0) {
            return [];
        }

        return [
            {
                message: editorI18n.t('error.intl.emptyKeys', {
                    keys: emptyKeys.map((key) => `"${key}"`).join(', ')
                }),
                getLocation: () => ({ origin: 'intl' } as const)
            }
        ];
    },
    set errors(_) {
        /* empty by design, only used to mitigate possible object assign errors */
    }
});

type HelperTranslation = { type: 'helper.translate'; key: string };

reaction(
    () => ({ config: configStore.valid, dirty: configStore.latestValidationId }),
    async ({ config, dirty }) => {
        if (dirty) return;

        const keys: IntlStore['keys'] = [];

        const lock = await createLock({ config });
        const compilationHook: CompilationHook = (source) => {
            if (!Array.isArray(source) && 'type' in source && source.type === 'helper.translate') {
                const key = (source as HelperTranslation).key;

                if (!keys.some((item) => item.key === key)) {
                    keys.push({ key });
                }
            }
        };

        await compileConfig({ config, lock, hooks: [compilationHook], envApi: {} });

        intlStore.keys = keys;

        if (keys.length > 0 && !intlStore.translations[intlStore.defaultLocale]) {
            intlStore.translations[intlStore.defaultLocale] = {};
        }

        for (const item of keys) {
            if (!intlStore.translations[intlStore.defaultLocale][item.key]) {
                intlStore.translations[intlStore.defaultLocale][item.key] = '';
            }
        }
    }
);

const localStorageStep4HintKey = '__TB_INTL_SHOW_STEP4_HINT';
const getLocalStorageStep4Hint = (): boolean => {
    try {
        const localStorageStep4Hint = localStorage.getItem(localStorageStep4HintKey);

        if (localStorageStep4Hint !== null) {
            const showHint = JSON.parse(localStorageStep4Hint);

            return Boolean(showHint);
        }

        return true;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }

    return false;
};

export const closeStep4Hint = () => {
    intlStore.showStep4Hint = false;
    localStorage.setItem(localStorageStep4HintKey, JSON.stringify(false));
};

intlStore.showStep4Hint = getLocalStorageStep4Hint();
