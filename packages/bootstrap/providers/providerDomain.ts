import { CoreApi } from '@toloka-tb/core/coreApi';
import { Compiler, Core } from '@toloka-tb/core/coreComponentApi';
import { JSONSchema7 } from 'json-schema';
import { IntlShape } from 'react-intl';

import { tagToType } from './utils/tag';

export type Lock = { [type: string]: string };
export type Translations = { [lang: string]: { [key: string]: string } };

// meta management
// @internal
export type ComponentMeta = {
    type: string;
    version: string;
    links: string[];
    editorLinks: string[];
    dependencies: Lock | null;

    i18nLinks?: {
        [locale: string]: {
            editor: string[];
        };
    };
};
// @internal
export const makeMetaCache = () => {
    const cache: { [tag: string]: Promise<ComponentMeta> } = {};

    return {
        maybeAdd: (tag: string, meta: Promise<ComponentMeta>) => {
            if (!cache[tag]) {
                cache[tag] = meta;
            }
        },
        get: (tag: string) => cache[tag],
        getByType: (type: string) => {
            for (const tag of Object.keys(cache)) {
                if (tagToType(tag) === type) {
                    return cache[tag];
                }
            }
        },
        _cache: cache
    };
};
// @internal
export type MetaCache = ReturnType<typeof makeMetaCache>;

// component module management
// @internal
export type TbComponent = {
    create: (core: Core, options: { env: object }) => Compiler<any, any>;
    translations?: Translations;
};
// @internal
export type Module = CoreApi | TbComponent;
// @internal
export type Editor = {
    schema: JSONSchema7;
    getDataSchema?: (props: unknown) => JSONSchema7;
    internal?: boolean;
};
export type EditorLocale = Translations[string];
export const getImportModuleVariable = (type: string, version: string) => `tb-${type}@${version}`;
export const getExportModuleVariable = (type: string, version: string) => `tb-real-${type}@${version}`;

// @internal
export type ComponentMap = { core: CoreApi } & { [type: string]: TbComponent };

// @internal
export type ComponentCache<ModuleType> = {
    maybeAddModule: (tag: string, loadModule: () => Promise<ModuleType>) => Promise<void>;
    getModule: (tag: string) => Promise<ModuleType>;
};

// @internal
export const makeComponentCache = <ModuleType>(): ComponentCache<ModuleType> => {
    const moduleCache: { [tag: string]: Promise<ModuleType> } = {};

    const slotCache: {
        [tag: string]: {
            promise: Promise<ModuleType>;
            resolve: (privateName: ModuleType) => void;
        };
    } = {};

    const cacheAPI = {
        maybeAddModule: async (tag: string, loadModule: () => Promise<ModuleType>) => {
            if (!moduleCache[tag]) {
                const moduleLoaded = loadModule();

                moduleCache[tag] = moduleLoaded;

                cacheAPI.getModule(tag);
                slotCache[tag].resolve(await moduleLoaded);
            }
        },
        getModule: (tag: string) => {
            if (!slotCache[tag]) {
                let fillSlot: (module: ModuleType) => void | undefined;
                const promise = new Promise<ModuleType>((resolve) => (fillSlot = resolve));

                slotCache[tag] = {
                    promise,
                    resolve: fillSlot!
                };
            }

            return slotCache[tag].promise;
        },
        _moduleCache: moduleCache,
        _slotCache: slotCache
    };

    return cacheAPI;
};

export type Intl = IntlShape;
