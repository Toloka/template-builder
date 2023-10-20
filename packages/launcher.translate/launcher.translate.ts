import { loadLibs, preFetch, setProviderOptions } from '@toloka-tb/bootstrap';
import { spinnerOverlayUI } from '@toloka-tb/bootstrap/ui/spinnerOverlay';
import { isAllowedOrigin } from '@toloka-tb/iframe-api/isAllowedOrigin';
import { TranslateTask } from '@toloka-tb/iframe-api/launcher.translate/protocol';
import { addPostMessageReactions, makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';

import { Store } from './src/store';

const params = new URLSearchParams(location.search.toLowerCase());
const prereleaseTag = params.get('registryPrereleaseTag'.toLowerCase()) || window.TB_REGISTRY_PRERELEASE_TAG;

setProviderOptions({ registryUrl: window.TB_REGISTRY_URL, registryPrereleaseTag: prereleaseTag });

spinnerOverlayUI.show();

const appLoaded = (async () => {
    await loadLibs();

    const app = await import('./src/App');

    return app;
})();

const storeLoaded = (async () => {
    await loadLibs();

    const storeModule = await import('./src/store');

    return storeModule;
})();

let store: Store | undefined;
const startTranslation = async (translateTask: TranslateTask) => {
    try {
        spinnerOverlayUI.show();

        preFetch(translateTask.template);

        const storeModule = await storeLoaded;

        const nextStore = await storeModule.createStore(
            translateTask.template,
            translateTask.templateLocales,
            translateTask.userLocale
        );

        if (store) {
            storeModule.updateStore(store, nextStore);
        } else {
            store = nextStore;

            const app = await appLoaded;

            app.render(store);
        }

        spinnerOverlayUI.hide();
    } catch (error) {
        spinnerOverlayUI.error(error);
        throw error;
    }
};

(async () => {
    addPostMessageReactions((event) => isAllowedOrigin(event.origin), {
        setTranslate: startTranslation
    });

    const response = await makePostMessageRequest(window.parent, 'translateReady', undefined);
    const initialState = response.data;

    startTranslation(initialState.translate);
})();
