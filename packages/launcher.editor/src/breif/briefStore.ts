import { compileConfig, createContext, createIntl } from '@toloka-tb/bootstrap';
import { Lock, TbContext, TbJsonConfig } from '@toloka-tb/bootstrap/domain';
import { JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';
import { observable, toJS } from 'mobx';

import { imageClassificationBreifConfig } from './config/imageClassificationBreifConfig';
import { objectRecognitionBreifConfig } from './config/objectRecognitionBreifConfig';
import { productSearchBreifConfig } from './config/productSearchBreifConfig';
import { textClassificationBreifConfig } from './config/textClassificationBreifConfig';
import { videoClassificationBreifConfig } from './config/videoClassificationBreifConfig';

export type BreifResult = {
    config: JSONConfig;
    input: object;
};

export type BreifEditorConfig = { config: TbJsonConfig; lock: Lock };
export type BreifConfig<Params extends object> = {
    name: string;
    getDefaultParams: () => Promise<Params>;
    getEditorConfig: () => Promise<BreifEditorConfig>;
    parse: (params: Params) => ({ isValid: true } & BreifResult) | { isValid: false };
};

export type BreifStore = {
    editorCtx: TbContext;
    result: BreifResult;
};

export type BreifMeta = {
    name: string;
    params: object;
};

export const createBriefStore = async <Params extends object>(
    config: BreifConfig<Params>,
    params: Params
): Promise<BreifStore> => {
    const editorConfigJSON = await config.getEditorConfig();

    const editorConfig = await compileConfig({ ...editorConfigJSON, envApi: {} });
    const intl = await createIntl({
        locales: ['en'],
        configTranslations: {},
        lock: editorConfigJSON.lock
    });
    const editorCtx = createContext({
        tbConfig: editorConfig,
        intl,
        input: {},
        output: { ...params }
    });

    editorCtx.showAllErrors = true;

    let lastResult: BreifResult;

    const store: BreifStore = observable({
        editorCtx,
        get result() {
            const params = toJS(store.editorCtx.output.value) as Params;
            const update = config.parse(params);

            if (!update.isValid) {
                return lastResult;
            }

            const meta: BreifMeta = {
                name: config.name,
                params
            };

            update.config.vars = {
                tbBrief: meta
            };

            lastResult = update;

            return lastResult;
        }
    });

    return store;
};

const templateIdToConfig: { [key: string]: BreifConfig<any> | undefined } = {
    image_classification: imageClassificationBreifConfig,
    videoModeration: videoClassificationBreifConfig,
    checkbox_dynamic: textClassificationBreifConfig,
    categorize: productSearchBreifConfig,
    polygon: objectRecognitionBreifConfig
};

const briefMetaToConfig: { [key: string]: BreifConfig<any> | undefined } = {
    [imageClassificationBreifConfig.name]: imageClassificationBreifConfig,
    [videoClassificationBreifConfig.name]: videoClassificationBreifConfig,
    [textClassificationBreifConfig.name]: textClassificationBreifConfig,
    [productSearchBreifConfig.name]: productSearchBreifConfig,
    [objectRecognitionBreifConfig.name]: objectRecognitionBreifConfig
};

export const parseBriefMeta = (config: string): BreifMeta | undefined => {
    try {
        const parsed = JSON.parse(config);
        const briefConfig = parsed.vars?.tbBrief;

        return briefConfig;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse config', config, e);

        return undefined;
    }
};

export const removeBriefMetaFromConfig = (config: BreifResult['config']) => {
    if (config.vars) {
        delete (config.vars as any).tbBrief;
    }
};

const pickBreifConfigAndParams = async (briefMeta: BreifMeta | undefined, templateId?: string) => {
    if (briefMeta) {
        const metaConfig = briefMetaToConfig[briefMeta.name];

        if (metaConfig) {
            return {
                config: metaConfig,
                params: briefMeta.params,
                source: 'config'
            };
        }
    }

    if (templateId) {
        const templateConfig = templateIdToConfig[templateId];

        if (templateConfig) {
            return {
                config: templateConfig,
                params: await templateConfig.getDefaultParams(),
                source: 'default'
            };
        }
    }

    return undefined;
};

export const tryCreateBrief = async (config: string, templateId?: string) => {
    const briefMeta = parseBriefMeta(config);
    const initInfo = await pickBreifConfigAndParams(briefMeta, templateId);

    if (!initInfo) {
        return;
    }

    return {
        store: await createBriefStore(initInfo.config, initInfo.params),
        enableBreifMode: initInfo.source === 'config'
    };
};
