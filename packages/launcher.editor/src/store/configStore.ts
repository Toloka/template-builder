import { mapObject } from '@toloka-tb/common/utils/mapObject';
import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';
import { parseJSON } from '@toloka-tb/lang.json';
import { action, observable, reaction, runInAction } from 'mobx';
import { editor } from 'monaco-editor';
import validateWorker from 'workerize-loader?inline!../components/Editor/lang/services/validation/validate';

import { editorI18n, i18nOptions } from '../i18n/editorI18n';
import { initEnConfig, initRuConfig, unknownLanguageInitConfig } from './initConfig';
const worker = validateWorker();
// import * as worker from '../components/Editor/lang/services/validation/validate';

import { uniqueId } from '../../../common/utils/uniqueId';
import { BreifStore } from '../breif/briefStore';
import { Marker } from '../components/Editor/lang/services/validation/validationTypes';
import { getComponentKeysets } from '../i18n/componentsI18n';
import { defaultConfig } from './defaults';
import { shallowObservable } from './shallowObservable';
import { tbStore } from './tbStore';

export type TbError = {
    location?: number;
    message: string;
};

export const workerContainer = {
    current: worker
};

export type ConfigState = {
    current: string;
    latestValidationId: string | false;

    valid: JSONConfig;

    monaco: editor.ICodeEditor | null;
    monacoModel: editor.IModel | null;

    nextValidationErrors: Marker[];
    errors: {
        validation: Marker[];
        parsing: string | undefined;
        compilation: string | undefined;
    };
    relevantErrors: TbError[];

    brief?: BreifStore;
};

const formatConfig = (config: JSONConfig) => JSON.stringify(config, null, 2);

const privateConfigStore = shallowObservable({
    current: formatConfig(defaultConfig())
});

export const configStore = shallowObservable<ConfigState>({
    latestValidationId: false,

    get current() {
        return privateConfigStore.current;
    },
    set current(newValue) {
        if (newValue === privateConfigStore.current) return;

        configStore.latestValidationId = uniqueId('config-validation');
        privateConfigStore.current = newValue;
    },
    valid: defaultConfig(),

    nextValidationErrors: [], // so we can updated errors synchronously with parsing
    errors: observable({
        validation: [], // = nextValidationErrors, when parsing is attempted
        parsing: undefined,
        compilation: undefined
    }),
    get relevantErrors(): TbError[] {
        const errors = configStore.errors;

        if (errors.validation.length) {
            return errors.validation.map((marker) => ({ message: marker.message, location: marker.from }));
        }
        if (errors.parsing) return [{ message: errors.parsing }];
        if (errors.compilation) return [{ message: errors.compilation }];

        return [];
    },

    monaco: null,
    monacoModel: null
});

let editorsWereProvided = false;
let hasPendingValidation = false;

const noVisibleText = /^\s*$/g;

const runValidation = async (text: string) => {
    const markers: Marker[] = [];
    const currentValidationId = configStore.latestValidationId;

    if (!editorsWereProvided) {
        hasPendingValidation = true;

        return;
    }

    if (noVisibleText.test(text)) {
        markers.push({
            from: 0,
            to: 1,
            message: editorI18n.t('error.emptyConfig')
        });
    } else {
        try {
            const { meta, value } = parseJSON(text);

            if (!value) {
                // just skip to parsing errors form meta
            } else if (value.type !== 'object') {
                markers.push({
                    from: 0,
                    to: text.length,
                    message: editorI18n.t('validation.rootMusBeObject')
                });
            } else {
                if (worker.validate === undefined) {
                    throw new Error(editorI18n.t('error.outdatedWebWorker'));
                }
                const validationMarkers: Marker[] = await worker.validate(value);

                validationMarkers.forEach((marker) => {
                    markers.push(marker);
                });
            }

            meta.errors.forEach((err) => {
                markers.push({
                    from: err.from,
                    to: err.to,
                    message: editorI18n.t(err.error)
                });
            });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);

            markers.push({
                from: 0,
                to: text.length,
                message: err.message || editorI18n.t('preview.unknownError')
            });
        }
    }

    if (currentValidationId === configStore.latestValidationId) {
        runInAction(() => {
            if (markers.length) {
                configStore.nextValidationErrors = markers;
            } else {
                if (configStore.nextValidationErrors.length > 0) {
                    configStore.nextValidationErrors = [];
                }
            }

            configStore.latestValidationId = false;
            hasPendingValidation = false;
        });
    }
};

editorI18n.on('loaded', () => {
    reaction(() => configStore.current, runValidation, { fireImmediately: true });
});

reaction(
    () => tbStore.editors,
    action((schemas) => {
        const editors = mapObject(schemas, (editor) => ({
            schema: editor.schema,
            internal: editor.internal
        }));

        worker.setEditors(editors);

        editorsWereProvided = true;
        if (hasPendingValidation) {
            runValidation(configStore.current);
        }
    })
);

editorI18n.on('loaded', () => {
    const resources = (editorI18n as any)?.store?.data || {};

    worker.setupWorkerI18n({ ...i18nOptions, resources, lng: editorI18n.language }, getComponentKeysets());
    runValidation(configStore.current);
});

const stringifiedInitRuConfig = formatConfig(initRuConfig);
const stringifiedInitEnConfig = formatConfig(initEnConfig);
const stringifiedUnknownLanguageInitConfig = formatConfig(unknownLanguageInitConfig);

const handleInitConfig = () => {
    if (
        [stringifiedInitRuConfig, stringifiedInitRuConfig, stringifiedUnknownLanguageInitConfig].includes(
            configStore.current
        )
    ) {
        configStore.current = editorI18n.language === 'ru' ? stringifiedInitRuConfig : stringifiedInitEnConfig;
    }
};

editorI18n.on('languageChanged', handleInitConfig);
editorI18n.on('initialized', handleInitConfig);
