import { availableLocales } from '../i18n/availableLocales';
import { LZString } from '../utils/lzw';
import { appState, configState, features as defaultFeatures, intl } from './defaults';
import { GetInitParams } from './getInitParams';

export const getInitParamsStandalone: GetInitParams = async () => {
    const params = new URLSearchParams(location.search.substr(1));
    const configParam = params.get('config');
    const localeParam = params.get('locale');
    const registryPrereleaseTag = params.get('registryPrereleaseTag') || window.TB_REGISTRY_PRERELEASE_TAG;
    const features = { ...defaultFeatures };

    if (configParam) {
        try {
            const jsonString = LZString.decompressFromEncodedURIComponent(configParam);

            if (jsonString !== null) {
                const decodedHash = JSON.parse(jsonString);

                configState.config = decodedHash.config;
                configState.input = decodedHash.input;
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }

    if (localeParam && availableLocales.includes(localeParam.toLowerCase() as typeof availableLocales[0])) {
        appState.locale = localeParam as typeof availableLocales[0];
    }

    return {
        appState,
        features,
        configState,
        intl,
        registryPrereleaseTag
    };
};
