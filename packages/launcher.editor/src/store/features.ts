import { observable, reaction } from 'mobx';

import { defaultFeatures } from './defaults';
import { unlockServices } from './idmStore';

export type Features = {
    fullscreen: boolean;
    submit: boolean;
    formReset: boolean;
    export: boolean;
    readonly: boolean;
    inferTolokaSpec: boolean;
    inferJSONSchema: boolean;
    intl: boolean;
    brief: { enabled: boolean; templateId: string };
    defaultDesktop: boolean;

    support: Partial<{
        onboarding: boolean;
        documentationUrl: {
            [langName: string]: string;
        };
    }>;

    panes: {
        config: boolean;
        preview: boolean;
        input: boolean;
    };

    componentScopes: string[];
};

export const featuresStore = observable<Features>(defaultFeatures());

reaction(
    () => featuresStore.componentScopes,
    (scopes) => scopes.length > 0 && unlockServices(scopes, false),
    { fireImmediately: true }
);
