import { isAllowedOrigin } from '@toloka-tb/iframe-api/isAllowedOrigin';
import { makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';

import { appState, configState, features, intl as defaultIntl } from './defaults';
import { GetInitParams } from './getInitParams';

export const getInitParamsIframe: GetInitParams = async () => {
    if (window.parent === window) return;

    const params = new URLSearchParams(location.search.substr(1));
    const registryPrereleaseTag = params.get('registryPrereleaseTag') || window.TB_REGISTRY_PRERELEASE_TAG;

    const response = await makePostMessageRequest(window.parent, 'editorReady', {
        features,
        appState,
        configState,
        defaultLocale: appState.locale
    });

    if (!isAllowedOrigin(response.originalEvent.origin)) {
        return;
    }

    const defaultLocale = response.data.defaultLocale || appState.locale;
    const intl = {
        ...(response.data.configState.intl || defaultIntl),
        defaultLocale,
        errors: []
    };

    return {
        features: {
            ...features,
            ...response.data.features
        },
        appState: response.data.appState,
        configState: response.data.configState,
        intl,
        registryPrereleaseTag
    };
};
