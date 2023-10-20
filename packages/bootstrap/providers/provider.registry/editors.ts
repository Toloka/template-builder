import { CertainPartial, TbJsonConfig } from '../../domain';
import { loadLibScripts } from '../../loadAsset/loadLibScripts';
import { loadLink } from '../../loadAsset/loadLink';
import {
    ComponentCache,
    ComponentMeta,
    Editor,
    EditorLocale,
    getExportModuleVariable,
    Lock,
    MetaCache
} from '../providerDomain';
import { toTag } from '../utils/tag';
import { traverse } from '../utils/traverse';
import { RegistryProviderOptions } from './options';

export const loadEditor = (componentMeta: ComponentMeta, editorCache: ComponentCache<Editor | undefined>) => {
    const editorType = `editor-${componentMeta.type}`;
    const tag = toTag(editorType, componentMeta.version);

    editorCache.maybeAddModule(tag, async () => {
        const exportVariable = getExportModuleVariable(editorType, componentMeta.version);

        await loadLibScripts();
        await Promise.all(componentMeta.editorLinks.map(loadLink));

        return (window as any)[exportVariable] as Editor | undefined;
    });

    return editorCache.getModule(tag);
};

const loadEditorLocale = (
    componentMeta: ComponentMeta,
    locale: string,
    editorLocaleCache: ComponentCache<EditorLocale>
) => {
    const localeType = `i18n/${locale}/${componentMeta.type}.editor`;
    const tag = toTag(localeType, componentMeta.version);

    editorLocaleCache.maybeAddModule(tag, async () => {
        const fileLinks = componentMeta.i18nLinks && componentMeta.i18nLinks[locale]?.editor;

        if (!fileLinks) {
            return {};
        }

        const exportVariable = getExportModuleVariable(localeType, componentMeta.version);

        await Promise.all(fileLinks.map(loadLink));

        return (window as any)[exportVariable] as EditorLocale;
    });

    return editorLocaleCache.getModule(tag);
};

export const getAllEditors = async (
    locale: string,
    { registryUrl, registryPrereleaseTag, metaCache, editorCache, editorLocaleCache }: RegistryProviderOptions
) => {
    const normalizedUrl = registryUrl.replace(/\/$/g, '');
    const queryParams = registryPrereleaseTag ? `?prerelease=${registryPrereleaseTag}` : '';

    const response = await fetch(`${normalizedUrl}/latest${queryParams}`);
    const data: { found: ComponentMeta[] } = await response.json();

    const componentsMeta = data.found.map((componentMeta) => {
        metaCache.maybeAdd(toTag(componentMeta.type, componentMeta.version), Promise.resolve(componentMeta));

        return componentMeta;
    });

    const editorList = await Promise.all(
        componentsMeta.map(async (meta) => {
            const [editor, translations] = await Promise.all([
                loadEditor(meta, editorCache),
                loadEditorLocale(meta, locale, editorLocaleCache)
            ]);

            return {
                type: meta.type,
                code: editor,
                translations
            };
        })
    );

    const editorMap: {
        [type: string]: CertainPartial<Editor, 'schema'> & { translations?: EditorLocale };
    } = {};

    for (const editor of editorList) {
        if (editor.code) {
            editorMap[editor.type] = { ...editor.code, translations: editor.translations };
        } else if (editor.translations) {
            editorMap[editor.type] = { translations: editor.translations };
        }
    }

    return editorMap;
};

const isTbObject = (value: unknown): value is { type: string } => {
    return Boolean(typeof value === 'object' && value && 'type' in value);
};

export const getLock = async (config: TbJsonConfig, metaCache: MetaCache) => {
    const coreMeta = await metaCache.getByType('core');

    const lock: Lock = {};

    if (!coreMeta) {
        return lock;
    }

    lock.core = coreMeta.version;

    const additions: Array<Promise<void>> = [];

    const addType = (type: string) => {
        additions.push(
            (async () => {
                const meta = await metaCache.getByType(type);

                if (meta) {
                    lock[type] = meta.version;
                }
            })()
        );
    };

    traverse(config, (value) => {
        if (isTbObject(value)) {
            addType(value.type);
        }
    });

    await Promise.all(additions);

    return lock;
};
