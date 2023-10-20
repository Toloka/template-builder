import { compileConfig, createContext, createIntl } from '@toloka-tb/bootstrap';
import { TbConfig, TbContext, TbJsonConfig, Translations } from '@toloka-tb/bootstrap/domain';
import { createInputStore, InputStore } from '@toloka-tb/editor.input';
import { createOutputStore, expire, OutputStore, setValue } from '@toloka-tb/editor.output';
import { createEnvStore, EnvStore } from '@toloka-tb/editor.preview';
import { Lock } from '@toloka-tb/iframe-api/utils/domain';
import { action, reaction, toJS } from 'mobx';
import { IntlShape } from 'react-intl';

import { shallowObservable } from '../utils/shallowObservable';

export type TemplateState = {
    config: TbJsonConfig;
    lock: Lock;
    input: object;
    intl: {
        translations: Translations;
        keys: Array<{ key: string }>;
    };
};

export type PreviewStore = {
    input: InputStore;
    output: OutputStore;

    ctx: TbContext;
    ctxUpdateTimeout: ReturnType<typeof window.setTimeout> | undefined;

    env: EnvStore;
    compiled: {
        tbConfig: TbConfig;
        tbIntl: IntlShape;
    };

    destroy: () => void;
};

const debounceDelay = 1000;
const updateCtx = action((store: PreviewStore, tbConfig: TbConfig, intl: IntlShape, input: InputStore['parse']) => {
    if (input.state === 'error') {
        return;
    }

    const oldCtx = store.ctx;

    store.ctx = createContext({ tbConfig, intl, input: input.value });
    store.ctx.isFocused = true;
    setValue(store.output, undefined);
    oldCtx.destroy();

    if (store.ctxUpdateTimeout) {
        clearTimeout(store.ctxUpdateTimeout);
        store.ctxUpdateTimeout = undefined;
    }
});

export const createPreviewStore = async (template: TemplateState, locales: string[]): Promise<PreviewStore> => {
    const envStore = createEnvStore();
    const compiled = shallowObservable({
        tbConfig: await compileConfig({ ...template, envApi: envStore.api }),
        tbIntl: await createIntl({ lock: template.lock, locales, configTranslations: template.intl.translations })
    });

    const previewStore: PreviewStore = shallowObservable({
        input: createInputStore(template.input),
        output: createOutputStore(undefined),

        ctx: createContext({ tbConfig: compiled.tbConfig, intl: compiled.tbIntl, input: template.input }),
        ctxUpdateTimeout: undefined,

        env: envStore,
        compiled,

        destroy: () => undefined
    });

    const disposeCtxUpdate = reaction(
        () => ({
            input: toJS(previewStore.input.parse),
            intl: previewStore.compiled.tbIntl,
            tbConfig: previewStore.compiled.tbConfig
        }),
        ({ tbConfig, input, intl }) => {
            if (previewStore.ctxUpdateTimeout) {
                clearTimeout(previewStore.ctxUpdateTimeout);
            }

            previewStore.ctxUpdateTimeout = setTimeout(() => {
                updateCtx(previewStore, tbConfig, intl, input);
            }, debounceDelay);
        }
    );

    const disposeOutputExpire = reaction(
        () => toJS(previewStore.ctx.output),
        () => expire(previewStore.output)
    );

    previewStore.destroy = () => {
        disposeOutputExpire();
        disposeCtxUpdate();
        previewStore.ctx.destroy();
    };

    return previewStore;
};

export const submitPreview = (store: PreviewStore) => {
    const value = store.ctx.submit();

    if (store.ctx.isValid) {
        setValue(store.output, value);
    }
};

export const resetPreviewCtx = (store: PreviewStore) => {
    updateCtx(store, store.compiled.tbConfig, store.compiled.tbIntl, store.input.parse);
};
