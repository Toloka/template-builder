import { loadAllEditors } from '@toloka-tb/bootstrap';
import { mapObject } from '@toloka-tb/common/utils/mapObject';
import i18n, { InitOptions } from 'i18next';
import HttpApi, { BackendOptions } from 'i18next-http-backend';
import { observable } from 'mobx';
import { initReactI18next } from 'react-i18next';

import { getArchetype } from '../components/Editor/lang/utils/getArchetype';
import { ComponentKeysets, setComponentKeysets } from './componentsI18n';

const namespace = 'launcher.editor' as const;

export const i18nOptions: InitOptions = {
    resources: {},
    lng: undefined,
    fallbackLng: false,
    ns: namespace,
    defaultNS: namespace,
    keySeparator: false as const,
    interpolation: {
        escapeValue: false as const
    }
};

declare const __webpack_public_path__: string;

declare const __i18nWebpackPluginAssetsMap__: string;

const assetsMap = JSON.parse(__i18nWebpackPluginAssetsMap__) as {
    [langAndNs: string]: string;
};

const backendOptions: BackendOptions = {
    loadPath: ([lang]: string[], [ns]: string[]) => {
        const basePath = __webpack_public_path__;
        const assetName = `${lang}/${ns}`;
        const assetPath = assetsMap[assetName];

        return `${basePath}${assetPath}`;
    }
};

i18n.use(initReactI18next);
if (process.env.NODE_ENV !== 'test') {
    i18n.use(HttpApi);
}
i18n.init({ ...i18nOptions, backend: backendOptions });

export const intlMessages = observable.box({});

// TODO: migrate fully to react intl to avoid usafe key sync patterns
const syncI18nextToReactIntl = () => {
    const keyset = (i18n as any).store.data[i18n.language]['launcher.editor'];

    intlMessages.set(mapObject(keyset, (value) => value.replace(/{{/g, '{').replace(/}}/g, '}')));
};

const loadLocale = async () => {
    const locale = i18n.language;

    const editors = await loadAllEditors(locale);
    const coreKeys = editors.core?.translations || {};

    const componentKeysets: ComponentKeysets = mapObject(editors, (editor, type) => {
        const componentKeys = editor.translations || {};

        if (getArchetype(type as string) === 'condition') {
            return {
                ...coreKeys,
                'properties.hint.description': coreKeys['properties.conditionHint.description'],
                'properties.hint.default': coreKeys['properties.conditionHint.default'],
                ...componentKeys
            };
        } else {
            return {
                ...coreKeys,
                ...componentKeys
            };
        }
    });

    await i18n.reloadResources(locale, namespace);

    syncI18nextToReactIntl();

    setComponentKeysets(componentKeysets);
};

i18n.on('languageChanged', loadLocale);

export const editorI18n = i18n;
