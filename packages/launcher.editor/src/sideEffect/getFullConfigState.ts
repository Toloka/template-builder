import { createLock } from '@toloka-tb/bootstrap';
import { EditorProtocol } from '@toloka-tb/iframe-api/launcher.editor/protocol';
import { toJS } from 'mobx';

import { editorI18n } from '../i18n/editorI18n';
import { configStore } from '../store/configStore';
import { featuresStore } from '../store/features';
import { inputStore } from '../store/inputStore';
import { intlStore } from '../store/intlStore';
import { getValidation } from './validation/getValidation';

export type FullConfigState = EditorProtocol['getConfig']['response'];

export const getFullConfigState = async () => {
    const response: FullConfigState = {
        input: inputStore.current,
        config: configStore.current,
        lock: await createLock({ config: configStore.valid })
    };

    const validation =
        featuresStore.inferTolokaSpec || featuresStore.inferJSONSchema
            ? await getValidation(configStore.valid, inputStore.valid)
            : undefined;

    if (validation && featuresStore.inferTolokaSpec) {
        const { input, output } = validation.spec.issues;
        const common = validation.issues;

        response.spec = {
            ...validation.spec,
            warnings: {
                input: input
                    .filter(({ key }) => key !== 'tolokaSpecGen.dataInputRequired')
                    .map(({ key, params }) => editorI18n.t(key, params)),
                output: output
                    .filter(({ key }) => key !== 'tolokaSpecGen.dataOutputRequired')
                    .map(({ key, params }) => editorI18n.t(key, params)),
                common: common.map(({ key, params }) => editorI18n.t(key, params))
            },
            issues: {
                input: input.map(({ key, params }) => ({ key, displayText: editorI18n.t(key, params) })),
                output: output.map(({ key, params }) => ({ key, displayText: editorI18n.t(key, params) })),
                common: common.map(({ key, params }) => ({ key, displayText: editorI18n.t(key, params) }))
            }
        };
    }

    if (validation && featuresStore.inferJSONSchema) {
        response.schema = {
            ...validation.schema,
            issues: {
                input: validation.schema.issues.input.map(({ key, params }) => ({
                    key,
                    displayText: editorI18n.t(key, params)
                })),
                output: validation.schema.issues.output.map(({ key, params }) => ({
                    key,
                    displayText: editorI18n.t(key, params)
                }))
            }
        };
    }

    if (featuresStore.intl) {
        response.intl = {
            translations: toJS(intlStore.translations, { recurseEverything: true }),
            keys: toJS(intlStore.keys, { recurseEverything: true })
        };
    }

    return response;
};
