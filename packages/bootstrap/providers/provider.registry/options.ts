import {
    ComponentCache,
    Editor,
    EditorLocale,
    makeComponentCache,
    makeMetaCache,
    MetaCache,
    Module
} from '../providerDomain';

export type RegistryProviderOptions = {
    registryUrl: string;
    registryPrereleaseTag: string;

    // @internal
    metaCache: MetaCache;
    // @internal
    componentCache: ComponentCache<Module>;
    // @internal
    editorCache: ComponentCache<Editor | undefined>; // some libs and core have no editor;
    // @internal
    editorLocaleCache: ComponentCache<EditorLocale>;

    // hack until field.uc-table gets off bootstrap
    _hotfixLinks: (links: string[]) => string[];
};

// @internal
export const makeDefaultOptions = (): RegistryProviderOptions => ({
    registryUrl: '',
    registryPrereleaseTag: '',
    metaCache: makeMetaCache(),
    componentCache: makeComponentCache(),
    editorCache: makeComponentCache(),
    editorLocaleCache: makeComponentCache(),
    _hotfixLinks: (x) => x
});
