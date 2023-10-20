import { loadLibs, preFetch, setProviderOptions } from '@toloka-tb/bootstrap';
import { spinnerOverlayUI } from '@toloka-tb/bootstrap/ui/spinnerOverlay';
import { isAllowedOrigin } from '@toloka-tb/iframe-api/isAllowedOrigin';
import {
    EmbedConfigState,
    EmbedFeatures,
    EmbedProtocol,
    TemplateState
} from '@toloka-tb/iframe-api/launcher.embed/protocol';
import { addPostMessageReactions, makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';

import { defaultFeatures } from './src/defaultFeatures';

const params = new URLSearchParams(location.search.toLowerCase());
const prereleaseTag = params.get('registryPrereleaseTag'.toLowerCase()) || window.TB_REGISTRY_PRERELEASE_TAG;

setProviderOptions({
    registryUrl: window.TB_REGISTRY_URL,
    registryPrereleaseTag: prereleaseTag
});

spinnerOverlayUI.show();

const appLoaded = (async () => {
    await loadLibs();
    const app = await import('./src/App');

    return app;
})();

const storeStarted = (async () => {
    await loadLibs();

    const store = await import('./src/store');

    return store;
})();

const setFeatures = async (newFeatures: EmbedFeatures) => {
    const store = await storeStarted;

    store.store.features = newFeatures;
};

const requestSubmit = async (): Promise<EmbedProtocol['requestSubmit']['response']> => {
    await loadLibs();

    const { store } = await import('./src/store');

    if (store.ctx) {
        const value = store.ctx.submit();

        if (store.ctx.isValid) {
            return {
                isValid: true,
                data: { output: value, files: { ...store.uploads.files } }
            };
        }
    }

    return {
        isValid: false
    };
};

const setTemplate = async (templateState: TemplateState) => {
    try {
        spinnerOverlayUI.show();

        preFetch(templateState);

        const store = await storeStarted;

        store.setTemplate(templateState);

        const app = await appLoaded;

        app.render(store.store, store.submitV2);

        spinnerOverlayUI.hide();
    } catch (error) {
        spinnerOverlayUI.error(error as Error);
        throw error;
    }
};

/** @deprecated */
const setConfig = async (configState: EmbedConfigState) => {
    const config = JSON.parse(configState.config);
    const input = JSON.parse(configState.input);

    await setTemplate({ config, lock: configState.lock, input, output: {}, uploads: [], intl: undefined });
};

addPostMessageReactions((event) => isAllowedOrigin(event.origin), {
    setIframeFeatures: setFeatures,
    setTemplate,
    requestSubmit,
    setConfig
});

(async () => {
    const response = await makePostMessageRequest(window.parent, 'embedReady', { features: defaultFeatures });
    const initialState = response.data;

    if (initialState.features) {
        await setFeatures(initialState.features);
    }

    if (initialState.configState) {
        await setConfig(initialState.configState);
    }

    if (initialState.templateState) {
        await setTemplate(initialState.templateState);
    }

    makePostMessageRequest(window.parent, 'started', undefined);
})();
