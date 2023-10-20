import { Intl, JsonConfig, Lock } from '../utils/domain';

type UploadId = string;

export type UploadItem = {
    id: UploadId;
    tmpId?: UploadId;
    state: 'pending' | 'uploading' | 'success' | 'failed';
    progress: number;
    previewLabel: string;
    previewUrl?: string;
    downloadUrl?: string;
    typeUrl?: string;
    created: number;
};
export type UploadsList = UploadItem[];

export type TemplateState = {
    config: JsonConfig;
    lock: Lock;
    intl?: Intl;

    input: object;
    output: object;
    uploads: UploadsList;
};

export type MetrikaParams = {
    id: number;
    trustedDomains?: string[];
    clickmap?: boolean;
    trackLinks?: boolean;
    accurateTrackBounce?: boolean;
    webvisor?: boolean;
    trackHash?: boolean;
};
export type EmbedFeatures = {
    submit: string | undefined;
    submitByEnter: boolean;
    locales: string[];
    isReadOnly?: boolean;
    hintPosition?: string;
    metrikaParams?: MetrikaParams;
};

type EmbedParentActions = {
    setTemplate: {
        request: TemplateState;
        response: void;
    };

    requestSubmit: {
        request: void;
        response:
            | {
                  isValid: true;
                  data: EmbedSubmitV2Request;
              }
            | {
                  isValid: false;
              };
    };

    /** @deprecated */
    setIframeFeatures: {
        request: EmbedFeatures;
        response: void;
    };
};

type EmbedSubmitV2Request = {
    output: object;
    files: {
        [uploadId: string]: File;
    };
};

export type EmbedState = {
    isFullscreen: boolean;
};

type EmbedChildActions = {
    // init
    embedReady: {
        request: {
            features: EmbedFeatures; // defaults
        };
        response: {
            features: EmbedFeatures;
            templateState: TemplateState;
            /**
             * @deprecated use `templateState` instead
             */
            configState?: EmbedConfigState;
        };
    };
    started: {
        request: void;
        response: void;
    };

    // submit
    embedSubmitV2: {
        request: EmbedSubmitV2Request;
        response: void;
    };

    // runtime
    reportFormHeight: {
        request: number;
        response: void;
    };

    embedValueChanged: {
        request: EmbedSubmitV2Request;
        response: void;
    };

    // runtime
    requestEmbedStateChange: {
        request: EmbedState; // requested
        response: EmbedState; // state to set
    };

    /** @deprecated use embedSubmitV2 */
    embedSubmit: {
        request: object;
        response: void;
    };

    fetch: {
        request: { url: string; requestInit?: object };
        response: string | Error | undefined;
    };
};

export type EmbedProtocol = EmbedParentActions & EmbedChildActions;

/** @deprecated */
export type EmbedConfigState = { config: string; input: string; lock: Lock };
