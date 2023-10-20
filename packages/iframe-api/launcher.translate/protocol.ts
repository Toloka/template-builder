import { Intl, JsonConfig, Lock } from '../utils/domain';

type FullIntl = Intl & { keys: Array<{ key: string }> };

export type TranslateTask = {
    template: {
        config: JsonConfig;
        lock: Lock;
        input: object;
        intl: FullIntl;
    };

    templateLocales: string[];
    userLocale: string;
};

type TranslateParentActions = {
    setTranslate: {
        request: TranslateTask;
        response: void;
    };
};

type TranslateChildActions = {
    // init
    translateReady: {
        request: undefined;
        response: {
            translate: TranslateTask;
        };
    };
    started: {
        request: void;
        response: void;
    };
};

export type TranslateProtocol = TranslateParentActions & TranslateChildActions;
