import { compileConfig, createContext, createIntl } from '@toloka-tb/bootstrap';
import { TbContext } from '@toloka-tb/bootstrap/domain';
import { EmbedFeatures, TemplateState, UploadsList } from '@toloka-tb/iframe-api/launcher.embed/protocol';
import { makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';
import { fetchViaPostMessage } from '@toloka-tb/iframe-api/utils/fetchViaPostMessage';
import { action, observable, reaction, toJS } from 'mobx';

import { defaultFeatures } from './defaultFeatures';
import { createFilesUploader } from './filesUploader';
import { throttle } from './utils/throttle';

export type Store = {
    features: EmbedFeatures;
    uploads: {
        data: UploadsList;
        files: { [id: string]: File };
    };

    templateState?: TemplateState;
    appState: {
        isFullscreen: boolean;
    };
    ctx?: TbContext;
};

export const store = observable<Store>(
    {
        features: observable(defaultFeatures),
        uploads: observable({
            data: [],
            files: {}
        }),
        templateState: undefined,
        appState: {
            isFullscreen: false
        }
    },
    undefined,
    { deep: false }
);

export const setTemplate = action((templateState: TemplateState) => {
    store.uploads.data = templateState.uploads;
    store.templateState = templateState;
});

export const filesUploader = createFilesUploader(store);

const setFullscreen = async (enabled: boolean) => {
    const { data } = await makePostMessageRequest(window.parent, 'requestEmbedStateChange', {
        isFullscreen: enabled
    });

    Object.assign(store.appState, data);

    return enabled;
};

reaction(
    () => {
        return {
            locales: store.features.locales,
            templateState: store.templateState,
            hintPosition: store.features.hintPosition
        };
    },
    async ({ locales, templateState, hintPosition }) => {
        if (!templateState) {
            return;
        }

        const config = await compileConfig({
            ...templateState,
            envApi: {
                getFilesUploader: () => filesUploader,
                isFullscreenAvailable: () => true,
                isModalOpenInFullscreen: () => true,
                toggleFullscreen: () => setFullscreen(!store.appState.isFullscreen),
                fetch: fetchViaPostMessage
            }
        });
        const intl = await createIntl({
            locales,
            configTranslations: templateState.intl?.translations || {},
            lock: templateState.lock
        });

        const oldCtx = store.ctx;

        store.ctx = createContext({
            tbConfig: config,
            intl,
            input: templateState.input,
            output: templateState.output
        });

        store.ctx!.isReadOnly = store.features.isReadOnly || false;
        store.ctx!.isFocused = true;
        store.ctx!.hintPosition = hintPosition;

        if (oldCtx) {
            oldCtx.destroy();
        }
    }
);

/**
 * @deprecated remove when the Nirvana service doesn't use `embedSubmit` event in production
 */
const submitV1 = (value: object) => {
    makePostMessageRequest(window.parent, 'embedSubmit', value);
};

reaction(
    () => {
        if (!store.ctx) return;

        return toJS(store.ctx.output.value);
    },
    throttle((output) => {
        if (output) {
            makePostMessageRequest(window.parent, 'embedValueChanged', { output, files: { ...store.uploads.files } });
        }
    }, 500)
);

export const submitV2 = (output: object) => {
    if (!store.ctx) return;
    if (!store.ctx.isValid) return;

    submitV1(output);
    makePostMessageRequest(window.parent, 'embedSubmitV2', { output, files: { ...store.uploads.files } });
};
