import { addPostMessageReactions, makePostMessageRequest } from '../rpc';
import { createMethodController } from '../utils/createMethodController';
import { DeepPartial } from '../utils/deepPartial';
import { ConfigState, EditorAppState, EditorFeatures, EditorProtocol } from './protocol';

export type TbEditorController = {
    getFeatures(): Promise<EditorFeatures>;
    setFeatures(features: DeepPartial<EditorFeatures>): Promise<void>;

    getAppState(): Promise<EditorAppState>;
    setAppState(editorState: DeepPartial<EditorAppState>): Promise<void>;

    getConfigState(): Promise<ConfigState>;
    setConfigState(configState: DeepPartial<ConfigState>): Promise<void>;

    getDefaultLocale(): Promise<string>;
    setDefaultLocale(configState: DeepPartial<string>): Promise<void>;

    destroy(): void;
};

type EditorControllerOptions = {
    origin: string;
    registryPrereleaseTag: string;
    appStateReducer: (state: EditorAppState, currentState: EditorAppState) => EditorAppState;
    initialStateReducer: (state: EditorProtocol['editorReady']['request']) => EditorProtocol['editorReady']['request'];
    onAppStateChange: (state: EditorAppState) => void;
    onConfigStateChange?: (state: EditorProtocol['getConfig']['response']) => void;
    onEditorOnboardingFinish?: (finishedOnboardingData: EditorProtocol['onEditorOnboardingFinish']['request']) => void;
    onFetch?: (args: EditorProtocol['fetch']['request']) => Promise<EditorProtocol['fetch']['response']> | undefined;
    onSwitchToBrief?: ({ force }: { force: boolean }) => void;
    onSwitchToCode?: () => void;
    onChangeVisualEditorConfig?: () => void;
    onChangeCodeConfig?: () => void;
    onToggleConfig?: (status: 'show' | 'hide') => void;
    onToggleInputData?: (status: 'show' | 'hide') => void;
    onToggleOutputData?: (status: 'show' | 'hide') => void;
    onTogglePreviewData?: (status: 'show' | 'hide') => void;
    onToggleFullscreen?: (status: 'on' | 'off') => void;
    onClickDocumentation?: () => void;
    onChangeInputDataConfig?: () => void;
    onClickSubmitPreview?: () => void;
    onClickResetPreview?: () => void;
};

const defaultEditorOptions: EditorControllerOptions = {
    origin: 'tb.toloka.dev',
    registryPrereleaseTag: '',
    appStateReducer: (x) => x,
    initialStateReducer: (x) => x,
    onAppStateChange: () => 0,
    onFetch: () => undefined
};

export const createTbEditorController = (
    iframeNode: HTMLIFrameElement,
    givenOptions: Partial<EditorControllerOptions> = {}
) => {
    let isReady = false;
    let resolveStarted: () => void;
    const startedPromise = new Promise((resolve) => {
        resolveStarted = resolve as () => void;
    });

    const options = { ...defaultEditorOptions, ...givenOptions };

    const featuresController = createMethodController(
        'setEditorFeatures',
        (a, b) => ({ ...a, ...b, panes: { ...a.panes, ...b.panes } }),
        {
            iframe: iframeNode,
            getIsReady: () => isReady,
            startedPromise
        }
    );

    const appStateController = createMethodController(
        'setAppState',
        (a, b) => ({ ...a, ...b, paneIsOpen: { ...a.paneIsOpen, ...b.paneIsOpen } }),
        {
            iframe: iframeNode,
            getIsReady: () => isReady,
            startedPromise,
            onChange: options.onAppStateChange
        }
    );

    const defaultLocaleController = createMethodController('setDefaultLocale', (_, b) => b, {
        iframe: iframeNode,
        getIsReady: () => isReady,
        startedPromise
    });

    const configStateController = createMethodController('setConfig', (a, b) => ({ ...a, ...b }), {
        iframe: iframeNode,
        getIsReady: () => isReady,
        startedPromise,
        getState: () => makePostMessageRequest(iframeNode.contentWindow, 'getConfig', undefined).then((x) => x.data)
    });

    const dispose = addPostMessageReactions((event) => iframeNode.contentWindow === event.source, {
        editorReady: async (initialState) => {
            featuresController.setInitial(initialState.features);
            appStateController.setInitial(initialState.appState);
            configStateController.setInitial(initialState.configState);
            defaultLocaleController.setInitial(initialState.defaultLocale);

            const features = await featuresController.get({ force: true });
            const appState = await appStateController.get({ force: true });
            const configState = await configStateController.get({ force: true });
            const defaultLocale = await defaultLocaleController.get({ force: true });

            isReady = true;

            return { configState, features, appState, defaultLocale };
        },
        started: () => resolveStarted(),
        requestEditorAppStateChange: async (requestedState) => {
            const appState = await appStateController.get();
            const newState = options.appStateReducer(requestedState, appState);

            appStateController.set(newState, { messageChild: false });

            return newState;
        },
        reportEditorConfigStateChange: async () => {
            if (options.onConfigStateChange) {
                const configState = await configStateController.get();

                options.onConfigStateChange(configState);
            }
        },
        onEditorOnboardingFinish: (payload) => {
            if (options.onEditorOnboardingFinish) {
                options.onEditorOnboardingFinish(payload);
            }
        },
        fetch: options.onFetch,
        onSwitchToBrief: ({ force }) => {
            if (options.onSwitchToBrief) {
                options.onSwitchToBrief({ force });
            }
        },
        onSwitchToCode: () => {
            if (options.onSwitchToCode) {
                options.onSwitchToCode();
            }
        },
        onToggleConfig: ({ status }) => {
            if (options.onToggleConfig) {
                options.onToggleConfig(status);
            }
        },
        onToggleInputData: ({ status }) => {
            if (options.onToggleInputData) {
                options.onToggleInputData(status);
            }
        },
        onToggleOutputData: ({ status }) => {
            if (options.onToggleOutputData) {
                options.onToggleOutputData(status);
            }
        },
        onTogglePreviewData: ({ status }) => {
            if (options.onTogglePreviewData) {
                options.onTogglePreviewData(status);
            }
        },
        onToggleFullscreen: ({ status }) => {
            if (options.onToggleFullscreen) {
                options.onToggleFullscreen(status);
            }
        },
        onClickDocumentation: () => {
            if (options.onClickDocumentation) {
                options.onClickDocumentation();
            }
        },
        onChangeVisualEditorConfig: () => {
            if (options.onChangeVisualEditorConfig) {
                options.onChangeVisualEditorConfig();
            }
        },
        onChangeCodeConfig: () => {
            if (options.onChangeCodeConfig) {
                options.onChangeCodeConfig();
            }
        },
        onChangeInputDataConfig: () => {
            if (options.onChangeInputDataConfig) {
                options.onChangeInputDataConfig();
            }
        },
        onClickSubmitPreview: () => {
            if (options.onClickSubmitPreview) {
                options.onClickSubmitPreview();
            }
        },
        onClickResetPreview: () => {
            if (options.onClickResetPreview) {
                options.onClickResetPreview();
            }
        }
    });

    const prereleaseTagParam = options.registryPrereleaseTag
        ? `&registryPrereleaseTag=${options.registryPrereleaseTag}`
        : '';

    iframeNode.src = `${options.origin.replace(/\/$/, '')}?embed${prereleaseTagParam}`;

    const controller: TbEditorController = {
        getFeatures: featuresController.get,
        setFeatures: featuresController.set,
        getAppState: appStateController.get,
        setAppState: appStateController.set,
        getConfigState: configStateController.get,
        setConfigState: configStateController.set,
        getDefaultLocale: defaultLocaleController.get,
        setDefaultLocale: defaultLocaleController.set,
        destroy: dispose
    };

    return controller;
};
