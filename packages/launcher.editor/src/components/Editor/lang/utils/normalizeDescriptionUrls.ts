import { editorI18n } from '../../../../i18n/editorI18n';

export const normalizeDescriptionUrls = <T extends string | undefined>(description: T): T => {
    if (!description) return description;

    return String(description).replace(
        /\[(.*?)\]\((..\/)?(.*?)\.(md|dita)(#.*?)?\)/gm,
        `[$1](${window.DOC_BASE_URL}/reference/$2$3.html$5?lang=${editorI18n.language})`
    ) as T;
};
