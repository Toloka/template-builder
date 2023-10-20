import { addPostMessageReactions, makePostMessageRequest } from '../rpc';
import { TranslateTask } from './protocol';

export type TbTranslateController = {
    setTranslate(templateState: TranslateTask): Promise<void>;

    destroy(): void;
};

type TranslateControllerOptions = {
    origin: string;
    registryPrereleaseTag: string;
};

const defaultIframeOptions: TranslateControllerOptions = {
    origin: 'tb.toloka.dev/iframe',
    registryPrereleaseTag: ''
};

export const createTbTranslateController = (
    iframeNode: HTMLIFrameElement,
    givenOptions: Partial<TranslateControllerOptions> = {}
): TbTranslateController => {
    let isReady = false;
    let resolveStarted: () => void;
    const startedPromise = new Promise((resolve) => {
        resolveStarted = resolve as () => void;
    });

    let translateTask: TranslateTask;

    const options = { ...defaultIframeOptions, ...givenOptions };

    const dispose = addPostMessageReactions((event) => iframeNode.contentWindow === event.source, {
        translateReady: async () => {
            isReady = true;

            return { translate: translateTask };
        },
        started: () => resolveStarted()
    });

    const prereleaseTagQuery = options.registryPrereleaseTag
        ? `?registryPrereleaseTag=${options.registryPrereleaseTag}`
        : '';

    iframeNode.src = `${options.origin.replace(/\/$/, '')}${prereleaseTagQuery}`;

    return {
        setTranslate: async (newTranslateTask) => {
            if (isReady) {
                await startedPromise;
                await makePostMessageRequest(iframeNode.contentWindow, 'setTranslate', newTranslateTask);
            } else {
                translateTask = newTranslateTask;
                await startedPromise;
            }

            return;
        },

        destroy: dispose
    };
};
