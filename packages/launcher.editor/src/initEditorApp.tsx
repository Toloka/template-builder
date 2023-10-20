import './store/idmStore';
import './sideEffect/controller';

import { ConfigState } from '@toloka-tb/iframe-api/launcher.editor/protocol';
import { initTheme } from '@toloka-tb/common/tools/initTheme';
import { runInAction } from 'mobx';
import * as React from 'react';
import { render } from 'react-dom';

import { tryCreateBrief } from './breif/briefStore';
import { createConfigBreifIntegration, swtichToBrief } from './breif/configBreifIntegration';
import { EditorApp } from './components/App/EditorApp';
import { AppState, appStore } from './store/appStore';
import { configStore } from './store/configStore';
import { Features, featuresStore } from './store/features';
import { inputStore } from './store/inputStore';
import { IntlStore, intlStore } from './store/intlStore';
import { TbState, tbStore } from './store/tbStore';

export const init = async ({
    editors,
    configState,
    features,
    appState,
    intl
}: {
    editors: TbState['editors'];
    features: Features;
    appState: Pick<AppState, 'isFullscreen'>;
    configState: ConfigState;
    intl: IntlStore;
}) => {
    initTheme();
    const rootNode = document.createElement('div');

    rootNode.setAttribute('id', 'root');
    rootNode.classList.add('text-m');

    if (!features.intl) {
        delete editors['helper.translate'];
    }

    const configString = configState.config || configStore.current;

    let brief:
        | {
              store: typeof configStore['brief'];
              enableBreifMode: boolean;
          }
        | undefined;

    if (features.brief.enabled) {
        appStore.locale = (appState as AppState).locale; // init locale early so brief mode can load relevent config
        brief = await tryCreateBrief(configString, features.brief.templateId);
    }

    // run everything relevant to first update together
    runInAction(() => {
        Object.assign(appStore, appState);
        Object.assign(intlStore, intl);
        Object.assign(featuresStore, features);

        // apply initial config immediately
        appStore.forceFastUpdate = true;
        tbStore.editors = editors;
        configStore.current = configString;
        inputStore.current = configState.input || inputStore.current;

        if (brief) {
            configStore.brief = brief.store;
            if (brief.enableBreifMode) {
                swtichToBrief({ force: true });
            }
            createConfigBreifIntegration();
        }
    });

    document.body.appendChild(rootNode);

    render(<EditorApp />, rootNode);
};
