import { addPostMessageReactions, makePostMessageRequest } from '../rpc';
import { createMethodController } from '../utils/createMethodController';
import { EmbedConfigState, EmbedFeatures, EmbedProtocol, EmbedState, TemplateState } from './protocol';

export type TbEmbedController = {
    getFeatures(): Promise<EmbedFeatures>;
    setFeatures(features: Partial<EmbedFeatures>): Promise<void>;

    setTemplate(templateState: TemplateState): Promise<void>;

    requestSubmit(): Promise<EmbedProtocol['requestSubmit']['response']>;

    destroy(): void;

    /**
     * @deprecated use `setTemplate` instead
     */
    setConfig(configState: EmbedConfigState, locales?: string[]): Promise<void>;
};

type EmbedControllerOptions = {
    origin: string;
    onFormHeightChange: (height: number) => void;
    onValueChange: (result: EmbedProtocol['embedValueChanged']['request']) => void;
    onSubmit: (result: EmbedProtocol['embedSubmit']['request']) => void;
    onSubmitV2: (result: EmbedProtocol['embedSubmitV2']['request']) => void;
    onFetch: (result: EmbedProtocol['fetch']['request']) => Promise<EmbedProtocol['fetch']['response']> | undefined;
    stateReducer: (state: EmbedState) => EmbedState;
    registryPrereleaseTag: string;
};

const defaultIframeOptions: EmbedControllerOptions = {
    origin: 'tb.toloka.dev/iframe',
    registryPrereleaseTag: '',
    onValueChange: () => undefined,
    onFormHeightChange: () => undefined,
    onSubmit: () => undefined,
    onSubmitV2: () => undefined,
    onFetch: () => undefined,
    stateReducer: (state) => state
};

export const createTbEmbedController = (
    iframeNode: HTMLIFrameElement,
    givenOptions: Partial<EmbedControllerOptions> = {}
): TbEmbedController => {
    let isReady = false;
    let resolveStarted: () => void;
    const startedPromise = new Promise((resolve) => {
        resolveStarted = resolve as () => void;
    });

    let configState: EmbedProtocol['embedReady']['response']['configState'] & { locales?: string[] };
    let templateState: TemplateState;

    const featuresController = createMethodController('setIframeFeatures', (a, b) => ({ ...a, ...b }), {
        iframe: iframeNode,
        getIsReady: () => isReady,
        startedPromise
    });

    const options = { ...defaultIframeOptions, ...givenOptions };

    const dispose = addPostMessageReactions((event) => iframeNode.contentWindow === event.source, {
        embedReady: async (initialState) => {
            featuresController.setInitial(initialState.features);

            const features = await featuresController.get({ force: true });

            isReady = true;

            return { features, configState, templateState };
        },
        started: () => resolveStarted(),
        embedValueChanged: options.onValueChange,
        reportFormHeight: options.onFormHeightChange,
        embedSubmit: options.onSubmit,
        embedSubmitV2: options.onSubmitV2,
        requestEmbedStateChange: async (requestedState) => {
            const newState = options.stateReducer(requestedState);

            return newState;
        },
        fetch: options.onFetch
    });

    const prereleaseTagQuery = options.registryPrereleaseTag
        ? `?registryPrereleaseTag=${options.registryPrereleaseTag}`
        : '';

    iframeNode.src = `${options.origin.replace(/\/$/, '')}${prereleaseTagQuery}`;

    return {
        getFeatures: featuresController.get,
        setFeatures: featuresController.set,
        /**
         * @deprecated use `setTemplate` instead
         */
        setConfig: async (newConfigState) => {
            if (isReady) {
                await startedPromise;
                await makePostMessageRequest(iframeNode.contentWindow, 'setConfig', { ...newConfigState });
            } else {
                configState = newConfigState;
                await startedPromise;
            }

            return;
        },

        requestSubmit: async () => {
            const { data } = await makePostMessageRequest(iframeNode.contentWindow, 'requestSubmit', undefined);

            return data;
        },

        setTemplate: async (newTemplateState) => {
            if (isReady) {
                await startedPromise;
                await makePostMessageRequest(iframeNode.contentWindow, 'setTemplate', newTemplateState);
            } else {
                templateState = newTemplateState;
                await startedPromise;
            }

            return;
        },

        destroy: dispose
    };
};
