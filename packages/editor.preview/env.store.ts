import { TolokaProxyEnvApi } from '@toloka/helper.proxy';
import { createFilesUploaderMock, FilesUploadEnvApi } from '@toloka-tb/editor.mock-file-uploader';
import { fetchViaPostMessage } from '@toloka-tb/iframe-api/utils/fetchViaPostMessage';
import { Layout, Notifications, TolokaEnvApi } from '@toloka-tb/plugin.toloka';
import { observable } from 'mobx';

type FetchApi = {
    fetch?: (params: { url: string; requestInit?: object }) => Promise<string | Error | undefined>;
};

export type EnvStore = {
    layout: Layout | undefined;
    Notifications: Notifications | undefined;

    api: FilesUploadEnvApi & TolokaEnvApi & TolokaProxyEnvApi & FetchApi;
};

export const createEnvStore = () => {
    const store: EnvStore = observable({
        layout: undefined,
        Notifications: undefined,

        get api() {
            const api: EnvStore['api'] = {
                setTolokaLayout: (layout) => (store.layout = layout),
                setTolokaNotificationsV2: (notifications) => (store.Notifications = notifications),
                getFilesUploader: createFilesUploaderMock,
                getTolokaProxiedUrl: (path) => {
                    const iframeMode = document.referrer && window.top !== window;
                    const workspaceOrigin = iframeMode ? new URL(document.referrer).origin : 'https://we.toloka.ai';

                    const normalPath = (path || '').replace(/^\/?/, '');

                    return [workspaceOrigin, 'api/proxy', normalPath].join('/');
                },
                fetch: fetchViaPostMessage
            };

            return api;
        }
    });

    return store;
};

export const resetEnvStore = (store: EnvStore) => {
    store.Notifications = undefined;
    store.layout = undefined;
};
