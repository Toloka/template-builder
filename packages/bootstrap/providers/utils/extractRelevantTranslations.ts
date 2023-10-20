import { Translations } from '../providerDomain';

export const extractRelevantTranslations = (translations: Translations, locales: string[]) => {
    const normalizedLocales = locales.map((l) => l.toLowerCase());
    const normalizedTranslations: Translations = {};

    for (const locale in translations) {
        normalizedTranslations[locale.toLowerCase()] = translations[locale];
    }

    const result: Translations[string] = {};

    // Fallback implementation. First apply low priority locales, than override them with high priority locales.
    for (let i = normalizedLocales.length - 1; i >= 0; --i) {
        Object.assign(result, normalizedTranslations[normalizedLocales[i]]);
    }

    return result;
};
