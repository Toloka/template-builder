import { Intl, Lock } from '../utils/domain';

export type ConfigState = {
    config: string;
    input: string;
    lock: Lock;
    intl?: Intl;
};

export type EditorFeatures = {
    fullscreen: boolean;
    submit: boolean;
    formReset: boolean;
    export: boolean;
    readonly: boolean;
    inferTolokaSpec: boolean;
    intl: boolean;
    brief: {
        enabled: boolean;
        templateId: string;
    };
    defaultDesktop: boolean;

    panes: {
        config: boolean;
        preview: boolean;
        input: boolean;
    };

    support: Partial<{
        onboarding: boolean;
        documentationUrl: {
            [langName: string]: string;
        };
        chatUrl: {
            [langName: string]: string;
        };
    }>;

    componentScopes: string[];
};

export type EditorAppState = {
    locale: 'ru' | 'en';
    isFullscreen: boolean;
    paneIsOpen: {
        config: boolean;
        preview: boolean;
        input: boolean;
    };
    ongoingOnboardings: {
        intro: boolean;
    };
};

type ValidationIssue = {
    key: string;
    displayText: string;
};

type EditorParentActions = {
    setEditorFeatures: {
        request: EditorFeatures;
        response: void;
    };
    setAppState: {
        request: EditorAppState;
        response: void;
    };
    setConfig: {
        request: ConfigState;
        response: void;
    };
    setDefaultLocale: {
        request: string;
        response: void;
    };

    // config cannot go through change request like appState for perf reasons
    getConfig: {
        request: void;
        response: ConfigState & {
            // depends on inferTolokaSpec feature
            spec?: {
                input: object;
                output: object;
                /**
                 * @deprecated use `issues` field instead
                 */
                warnings: {
                    common: string[];
                    input: string[];
                    output: string[];
                };
                issues: {
                    common: ValidationIssue[];
                    input: ValidationIssue[];
                    output: ValidationIssue[];
                };
            };

            // depends on inferJSONSchema feature
            schema?: {
                root: {
                    type: 'object';
                    properties: {
                        input: object; // JSONSchema
                        output: object; // JSONSchema
                    };
                    required: ['input', 'output'];
                };
                issues: {
                    input: ValidationIssue[];
                    output: ValidationIssue[];
                };
            };
        };
    };
};

type EditorChildActions = {
    // init
    editorReady: {
        request: {
            // defaults
            features: EditorFeatures;
            appState: EditorAppState;
            configState: ConfigState;
            defaultLocale: string;
        };
        response: {
            // actual initial state
            features: EditorFeatures;
            appState: EditorAppState;
            configState: ConfigState;
            defaultLocale: string;
        };
    };
    started: {
        request: void;
        response: void;
    };

    onEditorOnboardingFinish: {
        request: { onboardingName: string; finishType: 'completed' | 'aborted' };
        response: void;
    };

    // runtime
    requestEditorAppStateChange: {
        request: EditorAppState; // requested
        response: EditorAppState; // state to set
    };
    reportEditorConfigStateChange: {
        request: void;
        response: void;
    };

    fetch: {
        request: { url: string; requestInit?: object };
        response: string | Error | undefined;
    };

    onSwitchToBrief: {
        request: { force: boolean };
        response: void;
    };

    onSwitchToCode: {
        request: void;
        response: void;
    };

    onToggleConfig: {
        request: { status: 'show' | 'hide' };
        response: void;
    };

    onToggleInputData: {
        request: { status: 'show' | 'hide' };
        response: void;
    };

    onToggleOutputData: {
        request: { status: 'show' | 'hide' };
        response: void;
    };

    onTogglePreviewData: {
        request: { status: 'show' | 'hide' };
        response: void;
    };

    onToggleFullscreen: {
        request: { status: 'on' | 'off' };
        response: void;
    };

    onClickDocumentation: {
        request: void;
        response: void;
    };

    onChangeVisualEditorConfig: {
        request: void;
        response: void;
    };

    onChangeCodeConfig: {
        request: void;
        response: void;
    };

    onChangeInputDataConfig: {
        request: void;
        response: void;
    };

    onClickSubmitPreview: {
        request: void;
        response: void;
    };

    onClickResetPreview: {
        request: void;
        response: void;
    };
};

export type EditorProtocol = EditorParentActions & EditorChildActions;
