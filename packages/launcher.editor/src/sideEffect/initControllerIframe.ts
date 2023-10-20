import { isAllowedOrigin } from '@toloka-tb/iframe-api/isAllowedOrigin';
import { addPostMessageReactions, makePostMessageRequest, ReactionMap } from '@toloka-tb/iframe-api/rpc';
import { runInAction, toJS } from 'mobx';

import { availableLocales } from '../i18n/availableLocales';
import { AppState, appStore } from '../store/appStore';
import { configStore } from '../store/configStore';
import { featuresStore } from '../store/features';
import { inputStore } from '../store/inputStore';
import { intlStore } from '../store/intlStore';
import { getFullConfigState } from './getFullConfigState';

export const throttle = <Args extends any[]>(f: (...args: Args) => void, ms: number): ((...args: Args) => void) => {
    let lastArgs: Args | undefined;
    let timeout: ReturnType<typeof window.setTimeout> | undefined;

    const throttled = (...args: Args) => {
        if (timeout) {
            lastArgs = args;

            return;
        }

        f(...args);

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = undefined;
            if (lastArgs) {
                throttled(...lastArgs);
                lastArgs = undefined;
            }
        }, ms);
    };

    return throttled;
};

const makeTogglePanePostMessage = (pane: keyof AppState['paneIsOpen'], isOpen: boolean) => {
    if (pane === 'config') {
        makePostMessageRequest(window.parent, 'onToggleConfig', { status: isOpen ? 'show' : 'hide' });
    }
    if (pane === 'input') {
        makePostMessageRequest(window.parent, 'onToggleInputData', { status: isOpen ? 'show' : 'hide' });
    }
    if (pane === 'output') {
        makePostMessageRequest(window.parent, 'onToggleOutputData', { status: isOpen ? 'show' : 'hide' });
    }
    if (pane === 'preview') {
        makePostMessageRequest(window.parent, 'onTogglePreviewData', { status: isOpen ? 'show' : 'hide' });
    }
};

export const initOutputControllerIframe = () => {
    const inActionHandlers: ReactionMap = {
        getConfig: getFullConfigState,
        setConfig: async (newConfigState) => {
            runInAction(() => {
                appStore.forceFastUpdate = true;
                inputStore.current = newConfigState.input;
                configStore.current = newConfigState.config;
                if (newConfigState.intl) {
                    intlStore.keys = newConfigState.intl.keys;
                    intlStore.translations = newConfigState.intl.translations;
                }
            });
        },
        setEditorFeatures: async (newFeatures) => {
            runInAction(() => {
                Object.assign(featuresStore, newFeatures);
            });
        },
        setAppState: async (newAppState) => {
            runInAction(() => {
                Object.assign(appStore, newAppState);
            });
        },
        setDefaultLocale: async (locale) => {
            intlStore.defaultLocale = locale;
        }
    };

    const setFullscreen = async (enabled: boolean) => {
        const appState = toJS(appStore);

        const { data } = await makePostMessageRequest(window.parent, 'requestEditorAppStateChange', {
            locale: appState.locale || availableLocales[0],
            paneIsOpen: appState.paneIsOpen,
            isFullscreen: enabled,
            ongoingOnboardings: { intro: false }
        });

        makePostMessageRequest(window.parent, 'onToggleFullscreen', { status: enabled ? 'on' : 'off' });

        Object.assign(appStore, data);
    };

    const onConfigChange = throttle(
        () => makePostMessageRequest(window.parent, 'reportEditorConfigStateChange', undefined),
        500
    );

    window.addEventListener('blur', () => {
        makePostMessageRequest(window.parent, 'reportEditorConfigStateChange', undefined);
    });

    const setPaneOpen = async (pane: keyof AppState['paneIsOpen'], isOpen: boolean) => {
        const appState = toJS(appStore);

        const { data } = await makePostMessageRequest(window.parent, 'requestEditorAppStateChange', {
            isFullscreen: appState.isFullscreen,
            locale: appState.locale || availableLocales[0],
            paneIsOpen: {
                ...appState.paneIsOpen,
                [pane]: isOpen
            },
            ongoingOnboardings: {
                intro: false
            }
        });

        makeTogglePanePostMessage(pane, isOpen);

        Object.assign(appStore, data);
    };

    addPostMessageReactions((event) => isAllowedOrigin(event.origin), inActionHandlers);
    makePostMessageRequest(window.parent, 'started', undefined);

    const onConfigEditorChange = () => {
        makePostMessageRequest(window.parent, 'onChangeCodeConfig', undefined);
    };

    const onPreviewSubmit = () => {
        makePostMessageRequest(window.parent, 'onClickSubmitPreview', undefined);
    };

    const onPreviewReset = () => {
        makePostMessageRequest(window.parent, 'onClickResetPreview', undefined);
    };

    const onChangeInputDataConfig = () => {
        makePostMessageRequest(window.parent, 'onChangeInputDataConfig', undefined);
    };

    return {
        setPaneOpen,
        setFullscreen,
        onConfigChange,
        onConfigEditorChange,
        onPreviewSubmit,
        onPreviewReset,
        onChangeInputDataConfig
    };
};
