import { observable, reaction } from 'mobx';

import { availableLocales } from '../i18n/availableLocales';
import { Features } from './features';

export type EditorAppLocale = typeof availableLocales[number] | undefined;

type AllPanes = keyof Features['panes'] | 'output';
export type AppState = {
    isFullscreen: boolean;
    locale: EditorAppLocale;

    paneIsOpen: { [K in AllPanes]: boolean };

    modalIsOpen: {
        documentation: boolean;
        tolokaExport: boolean;
        settings: boolean;
    };

    forceFastUpdate: boolean;
    hasDebouncedUpdate: boolean;

    settings: {
        autocompleteHotkey: string;
        formatHotkey: string;
    };

    locales: string[];
    ongoingOnboardings: {
        intro: boolean;
    };

    configMode: 'brief' | 'json';
};

const localStorageSettingsKey = '__TB_USER_SETTINGS';
const getLocalStorageSettings = () => {
    try {
        const localStoredSettingsString = localStorage.getItem(localStorageSettingsKey);

        if (localStoredSettingsString !== null) {
            const settings: AppState['settings'] = JSON.parse(localStoredSettingsString);

            return settings;
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
};

export const appStore = observable<AppState>({
    locale: undefined,
    isFullscreen: false,

    paneIsOpen: {
        config: true,
        preview: true,
        input: false,
        output: false
    },

    modalIsOpen: {
        documentation: false,
        tolokaExport: false,
        settings: false
    },

    forceFastUpdate: true,
    hasDebouncedUpdate: false,

    settings: {
        autocompleteHotkey: 'Tab',
        formatHotkey: 'CtrlCmd+KEY_S',
        ...getLocalStorageSettings()
    },

    get locales(): string[] {
        const locale: EditorAppLocale = appStore.locale;

        if (locale === 'en' || !locale) {
            return ['en', 'ru'];
        }

        if (locale === 'ru') {
            return ['ru', 'en'];
        }

        return [locale, 'en', 'ru'];
    },

    ongoingOnboardings: {
        intro: false
    },

    configMode: 'json'
});

reaction(
    () => Object.values(appStore.settings),
    () => {
        localStorage.setItem(localStorageSettingsKey, JSON.stringify(appStore.settings));
    }
);

reaction(
    () => appStore.locale,
    (locale) => {
        import('../i18n/editorI18n').then(({ editorI18n }) => {
            editorI18n.changeLanguage(locale!);
        });
    }
);
