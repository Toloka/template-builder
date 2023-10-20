import { createIntl, createIntlCache } from 'react-intl';

import { Lock, Translations } from '../providerDomain';
import { addModuleTranslations } from '../utils/addModuleTranslations';
import { RegistryProviderOptions } from './options';
import { getComponents } from './provider.registry';

const componentCache = createIntlCache();

// @internal
export const getIntl = async (
    locales: string[],
    lock: Lock,
    configTranslations: Translations,
    providerOptions: RegistryProviderOptions
) => {
    const components = await getComponents(lock, providerOptions);

    const finalMessages: Translations[string] = {};

    for (const [type, component] of Object.entries(components)) {
        if (component.translations) {
            addModuleTranslations({ result: finalMessages, type, translations: component.translations, locales });
        }
    }
    addModuleTranslations({ result: finalMessages, type: 'config', translations: configTranslations, locales });

    return createIntl({ locale: locales[0], messages: finalMessages }, componentCache);
};
