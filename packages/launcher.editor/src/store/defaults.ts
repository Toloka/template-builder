import { Lock } from '@toloka-tb/bootstrap/domain';
import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';
import { EditorAppState } from '@toloka-tb/iframe-api/launcher.editor/protocol';

import { availableLocales } from '../i18n/availableLocales';
import { Features } from './features';
import { unknownLanguageInitConfig } from './initConfig';
import { IntlStore } from './intlStore';

export const defaultConfig = (): JSONConfig => unknownLanguageInitConfig;
export const defaultLock = (): Lock => ({
    'view.list': '1.0.0',
    'view.text': '1.0.0',
    core: '1.0.0'
});

export const defaultInput = () => ({});

export const defaultFeatures = (): Features => ({
    fullscreen: false,
    submit: true,
    formReset: true,
    export: true,
    readonly: false,
    inferTolokaSpec: true,
    inferJSONSchema: false,
    intl: false,
    brief: { enabled: false, templateId: 'none' },
    defaultDesktop: false,

    support: {
        documentationUrl: {
            ru: 'https://toloka.ai/docs/template-builder/',
            en: 'https://toloka.ai/docs/template-builder/'
        },
        onboarding: false
    },

    panes: {
        config: true,
        preview: true,
        input: true
    },

    componentScopes: [],
});

export const defaultAppState = (): EditorAppState => ({
    isFullscreen: false,
    locale: availableLocales[0],
    paneIsOpen: {
        config: true,
        preview: true,
        input: false
    },
    ongoingOnboardings: {
        intro: false
    }
});

export const defaultIntlState = (): IntlStore => ({
    translations: {},
    defaultLocale: '',
    keys: [],
    errors: []
});
