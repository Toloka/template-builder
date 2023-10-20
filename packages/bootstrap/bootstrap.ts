import { IntlShape } from 'react-intl';

import { CompilationHook, Core2TbType, Tb2CoreType, TbConfig, TbContext, TbJsonConfig } from './domain';
import { loadLibScripts } from './loadAsset/loadLibScripts';
import { getAllEditors, getLock } from './providers/provider.registry/editors';
import { makeDefaultOptions, RegistryProviderOptions } from './providers/provider.registry/options';
import { getComponents } from './providers/provider.registry/provider.registry';
import { Intl, Lock, Translations } from './providers/providerDomain';
import { extractRelevantTranslations } from './providers/utils/extractRelevantTranslations';

// we create default options once so caches would persist
const defaultOptions = makeDefaultOptions();
let providerOptions: RegistryProviderOptions = defaultOptions;

export const setProviderOptions = (newOptions: Partial<RegistryProviderOptions>) => {
    providerOptions = { ...defaultOptions, ...newOptions };
};

export const preFetch = ({ lock }: { lock: Lock }) => {
    getComponents(lock, providerOptions);
};

// old core compat
const registered = new Set<string>();

export const compileConfig = async ({
    lock,
    config,
    envApi,
    hooks
}: {
    lock: Lock;
    config: TbJsonConfig;
    envApi: object;
    // @internal
    hooks?: CompilationHook[];
}): Promise<TbConfig> => {
    const { core, ...components } = await getComponents(lock, providerOptions);
    const jsonConfig = config as Tb2CoreType<typeof config>;

    for (const [type, component] of Object.entries(components)) {
        if (registered.has(type) || !component || !component.create) {
            continue;
        }

        const compiler = component.create(core, { env: envApi });

        core.register(compiler);
        registered.add(type);
    }

    const tbConfig = core.compileConfig(jsonConfig, { core, hooks });

    // ensure compatibility with old core
    tbConfig.core = core;

    return tbConfig as Core2TbType<typeof tbConfig>;
};

export const createIntl = async ({
    locales,
    lock,
    configTranslations
}: {
    locales: string[];
    lock: Lock;
    configTranslations: Translations;
}): Promise<IntlShape> => {
    await loadLibScripts();

    const { getIntl } = await import('./providers/provider.registry/translations');
    const intl = await getIntl(locales, lock, configTranslations, providerOptions);

    return intl;
};

export const createContext = ({
    tbConfig,
    input,
    output,
    intl
}: {
    tbConfig: TbConfig;
    input: object;
    output?: object;
    intl: Intl;
}): TbContext => {
    const config = tbConfig as Tb2CoreType<typeof tbConfig>;
    const core = config.core!;

    const ctx = core.makeCtxV2 ? core.makeCtxV2(config, input, intl, output) : core.makeCtx(config, input, output);

    // ensure compatibility with old core
    ctx.Component = config.core!.Tb;

    return (ctx as unknown) as Core2TbType<typeof ctx>;
};

export const loadLibs = async () => {
    await loadLibScripts();
};

export const loadAllEditors = (locale: string) => getAllEditors(locale, providerOptions);
export const createLock = async ({ config }: { config: TbJsonConfig }) => getLock(config, providerOptions.metaCache);

export { extractRelevantTranslations };
