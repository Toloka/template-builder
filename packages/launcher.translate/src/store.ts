import { extractRelevantTranslations } from '@toloka-tb/bootstrap';
import { observable } from 'mobx';

import translations from '../i18n/launcher.translate.translations';
import { createPreviewStore, PreviewStore, TemplateState } from './Preview/preview.store';
import { shallowObservable } from './utils/shallowObservable';

export type Store = {
    ui: {
        locale: string;
        translations: { [key: string]: string };
    };

    preview: PreviewStore;

    destroy: () => void;
};

export const createStore = async (
    template: TemplateState,
    templateLocales: string[],
    userLocale: string
): Promise<Store> => {
    const previewStore = await createPreviewStore(template, templateLocales);

    return shallowObservable({
        preview: previewStore,
        ui: observable({
            locale: userLocale,
            get translations() {
                return extractRelevantTranslations(translations, [userLocale, 'en', 'ru']);
            }
        }),
        destroy: previewStore.destroy
    });
};

export const updateStore = (store: Store, nextStore: Store) => {
    store.preview = nextStore.preview;
    store.ui = nextStore.ui;

    store.destroy();
    store.destroy = nextStore.destroy;
};
