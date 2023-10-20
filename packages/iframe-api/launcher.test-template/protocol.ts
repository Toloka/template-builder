import { Intl, Lock } from '../utils/domain';

type TestTemplateParentActions = {
    _testTemplateStart: {
        request: {
            config: {
                config: string;
                input: string;
                lock: Lock;
                intl?: Intl;
            };
            input: Array<{ id: string; input_values: unknown; solutions: unknown }>;
            prereleaseTag: string;
            locale: string;
        };
        response: void;
    };
    _testTemplateSubmit: {
        request: void;
        response: Array<{ task_id: string; output_values: unknown }> | undefined;
    };
    _testTemplateGetText: {
        request: void;
        response: string;
    };
    started: {
        request: void;
        response: void;
    };
};
type TestTemplateChildActions = {};

export type TestTemplateProtocol = TestTemplateParentActions & TestTemplateChildActions;
