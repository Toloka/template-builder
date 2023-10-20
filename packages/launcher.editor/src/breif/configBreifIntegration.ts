import { makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';
import { action, reaction, toJS } from 'mobx';
import isEqual from 'react-fast-compare';

import { editorI18n } from '../i18n/editorI18n';
import { appStore } from '../store/appStore';
import { configStore } from '../store/configStore';
import { inputStore } from '../store/inputStore';
import { BreifResult, removeBriefMetaFromConfig } from './briefStore';

const applyBriefToConfig = action((brief: BreifResult) => {
    configStore.current = JSON.stringify(brief.config, null, 4);
    inputStore.current = JSON.stringify(brief.input, null, 4);
});

const parseAndRemoveBreifMetaFromConfig = action(() => {
    try {
        const config = JSON.parse(configStore.current);

        removeBriefMetaFromConfig(config);
        configStore.current = JSON.stringify(config, null, 4);
    } catch (e) {
        /* this is likely ok */
        // eslint-disable-next-line no-console
        console.error('Cannot remove "breif" from config', e);
    }
});

const isConfigEqualToBreif = (configString: string, inputString: string, brief: BreifResult) => {
    try {
        const config = JSON.parse(configString);
        const input = JSON.parse(inputString);

        const sameView = isEqual(config.view, brief.config.view);
        const samePlugins = isEqual(config.plugins, brief.config.plugins);
        const noVars = isEqual(config.vars, {});
        const sameInput = isEqual(input, brief.input);

        return sameView && samePlugins && noVars && sameInput;
    } catch (e) {
        /* this is likely ok */
        // eslint-disable-next-line no-console
        console.error('Cannot parse config', e);
    }

    return false;
};

export const swtichToBrief = action((options?: { force?: boolean }) => {
    const brief = configStore.brief?.result!;

    if (!isConfigEqualToBreif(configStore.current, inputStore.current, brief) && !options?.force) {
        // eslint-disable-next-line no-alert
        const ok = confirm(
            `${editorI18n.t('codeVisualWariningPopup.title')}\n${editorI18n.t('codeVisualWariningPopup.content')}`
        );

        if (!ok) {
            return;
        }
    }

    // if decided to drop their changes or didn't make any
    applyBriefToConfig(brief);
    appStore.paneIsOpen.config = true;
    appStore.paneIsOpen.preview = true;
    appStore.paneIsOpen.input = false;
    appStore.configMode = 'brief';

    makePostMessageRequest(window.parent, 'onSwitchToBrief', { force: Boolean(options && options.force) });
});

export const swtichToCode = action(() => {
    const brief = configStore.brief?.result!;

    applyBriefToConfig(brief);
    parseAndRemoveBreifMetaFromConfig();

    if (configStore.monacoModel) {
        configStore.monacoModel.setValue(configStore.current);
    }
    if (inputStore.monacoModel) {
        inputStore.monacoModel.setValue(inputStore.current);
    }
    appStore.configMode = 'json';

    makePostMessageRequest(window.parent, 'onSwitchToCode', undefined);
});

export const createConfigBreifIntegration = () =>
    reaction(
        () => toJS(configStore.brief?.result),
        (brief) => {
            if (brief && appStore.configMode === 'brief') {
                applyBriefToConfig(brief);
                makePostMessageRequest(window.parent, 'onChangeVisualEditorConfig', undefined);
            }
        }
    );
