import { editorI18n } from '../../i18n/editorI18n';

const translationsReady = new Promise((resolve) => editorI18n.on('loaded', resolve));

export const getDataFromKey = <T>(key: string) => {
    return async (): Promise<T> => {
        await translationsReady;

        const paramsJSON = editorI18n.t(key);

        return JSON.parse(paramsJSON);
    };
};
