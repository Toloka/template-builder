import { Translations } from '../providerDomain';
import { extractRelevantTranslations } from './extractRelevantTranslations';

export const addModuleTranslations = ({
    result,
    type,
    locales,
    translations
}: {
    result: Translations[string];
    type: string;
    translations: { [lang: string]: { [key: string]: string } };
    locales: string[];
}) => {
    const messages = extractRelevantTranslations(translations, locales);

    for (const key in messages) {
        result[`${type}_${key}`] = messages[key];
    }
};
