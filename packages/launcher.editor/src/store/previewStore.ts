import { compileConfig, createContext, createIntl, createLock } from '@toloka-tb/bootstrap';
import { TbContext } from '@toloka-tb/bootstrap/domain';
import { CompilationHook } from '@toloka-tb/core/compileConfig/compileConfig';
import { DataLocal } from '@toloka-tb/core/data/local';
import { DataRelative } from '@toloka-tb/core/data/relative';
import { createOutputStore, setValue } from '@toloka-tb/editor.output';
import { createEnvStore, EnvStore, resetEnvStore } from '@toloka-tb/editor.preview';
import { action, observable, reaction, runInAction, toJS } from 'mobx';
import isEqual from 'react-fast-compare';

import { controller } from '../sideEffect/controller';
import { prettifyJsonError } from '../utils/prettifyJsonError';
import { appStore } from './appStore';
import { configStore } from './configStore';
import { featuresStore } from './features';
import { inputStore } from './inputStore';
import { intlStore } from './intlStore';
import { shallowObservable } from './shallowObservable';

export type ContextDependentData = {
    readable: { [path: string]: object };
    writable: { [path: string]: object };
};

export type PreviewState = {
    ctx: TbContext | undefined;
    env: EnvStore;
};

export const outputStore = createOutputStore({});
export const previewStore = shallowObservable<PreviewState>({
    ctx: undefined,
    env: createEnvStore()
});

const debounceDelay = 1000;

export const contextDependentData = observable<ContextDependentData>({
    readable: {},
    writable: {}
});

export const updatePreview = async () => {
    configStore.errors.compilation = undefined;

    if (configStore.errors.validation.length > 0) {
        return;
    }

    setValue(outputStore, undefined);

    contextDependentData.readable = {};
    contextDependentData.writable = {};

    resetEnvStore(previewStore.env);

    const compilationHook: CompilationHook<DataLocal<object> | DataRelative<object> | object> = (
        _source,
        result,
        path
    ) => {
        if ('__dataType' in result) {
            if (result.__dataType === 'data.local') {
                result.__spying.spy((value) => (contextDependentData.readable[path] = value));
            }
            if (result.__dataType === 'data.relative') {
                result.__spying.spy((value) => (contextDependentData.writable[path] = value));
            }
        }
    };

    try {
        runInAction(() => {
            appStore.hasDebouncedUpdate = true;
        });

        const lock = await createLock({ config: configStore.valid });

        const compiledConfig = await compileConfig({
            config: configStore.valid,
            lock,
            hooks: [compilationHook as CompilationHook<unknown>],
            envApi: previewStore.env.api
        });

        const oldCtx = previewStore.ctx;
        const intl = await createIntl({
            locales: featuresStore.intl ? [intlStore.defaultLocale, ...appStore.locales] : appStore.locales,
            configTranslations: intlStore.translations,
            lock
        });

        runInAction(() => {
            previewStore.ctx = createContext({ input: inputStore.valid, intl, tbConfig: compiledConfig });
            previewStore.ctx.isFocused = true;
            if (oldCtx) {
                oldCtx.destroy();
            }
            controller.onConfigChange();
        });
    } catch (err) {
        runInAction(() => {
            // eslint-disable-next-line no-console
            console.error(err); // we expect these not to occur
            configStore.errors.compilation = (err as Error).toString();
        });
    }

    runInAction(() => {
        appStore.hasDebouncedUpdate = false;
    });
};

const updateParsed = action(() => {
    inputStore.errors.validation = inputStore.nextValidationErrors;
    configStore.errors.validation = configStore.nextValidationErrors;

    try {
        configStore.valid = JSON.parse(configStore.current);
        configStore.errors.parsing = undefined;
    } catch (error) {
        configStore.errors.parsing = prettifyJsonError((error as Error).message, configStore.current);
    }

    try {
        inputStore.valid = JSON.parse(inputStore.current);
        inputStore.errors.parsing = undefined;
    } catch (error) {
        inputStore.errors.parsing = prettifyJsonError((error as Error).message, inputStore.current);
    }

    if (!configStore.errors.parsing && !inputStore.errors.parsing) {
        updatePreview();
    } else {
        appStore.hasDebouncedUpdate = false;
    }
});

let updateTimeout = 0;

import('./configStore').then(({ configStore }) => {
    reaction(
        () => ({
            input: inputStore.current,
            config: configStore.current,
            configIsDirty: configStore.latestValidationId,
            inputIsDirty: inputStore.isDirty,
            validationErrors: configStore.nextValidationErrors,
            inputValidationErrors: inputStore.nextValidationErrors,
            locales: appStore.locales,
            translations: toJS(intlStore.translations, { recurseEverything: true }),
            keys: toJS(intlStore.keys)
        }),
        ({ configIsDirty, inputIsDirty }) => {
            clearTimeout(updateTimeout);
            appStore.hasDebouncedUpdate = false;

            if (configIsDirty || inputIsDirty) {
                return;
            }

            if (appStore.forceFastUpdate) {
                updateTimeout = window.setTimeout(() => {
                    appStore.forceFastUpdate = false;
                    updateParsed();
                }, 0);
            } else {
                appStore.hasDebouncedUpdate = true;
                updateTimeout = window.setTimeout(updateParsed, debounceDelay);
            }
        },
        {
            equals: isEqual
        }
    );

    // this should be in config store but we get a circular dependency in that case
    reaction(
        () => configStore.valid,
        () => controller.onConfigChange()
    );
});
reaction(
    () => toJS(previewStore.ctx?.output.value),
    () => (outputStore.expired = true)
);
