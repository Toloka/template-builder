import { loadAllEditors, loadLibs, setProviderOptions } from '@toloka-tb/bootstrap';
import { spinnerOverlayUI } from '@toloka-tb/bootstrap/ui/spinnerOverlay';

import { getInitParams } from './src/init/getInitParams';

spinnerOverlayUI.show();

const appLoaded = (async () => {
    await loadLibs();

    const app = await import('./src/initEditorApp');

    return app;
})();

(async () => {
    const params = await getInitParams();

    if (!params) {
        return;
    }

    setProviderOptions({
        registryUrl: window.TB_REGISTRY_URL,
        registryPrereleaseTag: params.registryPrereleaseTag,
        // hack until field.uc-table gets off bootstrap
        _hotfixLinks: (links) => {
            const brokenBootstrapLink = links.find((link) => link.includes('field.uc-table') && link.endsWith('.css'));

            return links.filter((link) => link !== brokenBootstrapLink);
        }
    });

    const [app, editors] = await Promise.all([appLoaded, loadAllEditors(params.appState.locale)]);

    spinnerOverlayUI.hide();

    await app.init({ ...params, editors });

    spinnerOverlayUI.hide();
})().catch(spinnerOverlayUI.error);
