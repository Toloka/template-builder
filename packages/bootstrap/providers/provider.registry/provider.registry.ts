import { loadLibScripts } from '../../loadAsset/loadLibScripts';
import { loadLink } from '../../loadAsset/loadLink';
import { ComponentMap, ComponentMeta, getExportModuleVariable, Lock, Module } from '../providerDomain';
import { toTag } from '../utils/tag';
import { waitForDependency } from '../utils/waitForDependency';
import { RegistryProviderOptions } from './options';
import { getComponentsMeta } from './resolve';

const loadModule = (
    componentMeta: ComponentMeta,
    { componentCache, _hotfixLinks: _hotfixLink }: RegistryProviderOptions
) => {
    const tag = toTag(componentMeta.type, componentMeta.version);

    componentCache.maybeAddModule(tag, async () => {
        const dependenciesLoaded = Object.entries(componentMeta.dependencies || {}).map(([type, version]) =>
            waitForDependency(type, version, componentCache)
        );
        const exportVariable = getExportModuleVariable(componentMeta.type, componentMeta.version);

        await loadLibScripts();

        // Remove chunks from initial loading
        const links = _hotfixLink(componentMeta.links.filter((link) => !link.match(/\/chunk-[^/]+$/)));

        await Promise.all(links.map(loadLink));
        await Promise.all(dependenciesLoaded);

        return (window as any)[exportVariable] as Module;
    });

    return componentCache.getModule(tag);
};

// @internal
export const getComponents = async (lock: Lock, options: RegistryProviderOptions) => {
    const componentsMeta = await getComponentsMeta(lock, options);

    const modules = await Promise.all(
        componentsMeta.map(async (meta) => ({
            code: await loadModule(meta, options),
            type: meta.type
        }))
    );

    // we expect to find core in the loop
    const components = {} as ComponentMap;

    for (const module of modules) {
        if ('isTbCore' in module.code) {
            components.core = module.code;
        } else {
            components[module.type] = module.code;
        }
    }

    return components;
};
