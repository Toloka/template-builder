import { ComponentCache, getImportModuleVariable, Module } from '../providerDomain';
import { toTag } from './tag';

// @internal
export const waitForDependency = async (type: string, version: string, componentCache: ComponentCache<Module>) => {
    const publicName = getImportModuleVariable(type, version);
    const tag = toTag(type, version);

    // stub dependency object for webpack imports
    if (!(window as any)[publicName]) {
        (window as any)[publicName] = {} as any;
    }

    const module = await componentCache.getModule(tag);

    // actually fill webpack module with it's contents
    Object.assign((window as any)[publicName], module);
};
