import { ComponentMeta, MetaCache } from '../providerDomain';
import { toTag } from './tag';

// expects all tags and their dependencies to be in the cache already
// @internal
export const flattenDependencyTree = (initialTags: string[], cache: MetaCache) =>
    new Promise<ComponentMeta[]>((resolve) => {
        const progress: { [tag: string]: 'progress' | 'done' } = {};
        const meta: ComponentMeta[] = [];

        const process = async (componentTag: string) => {
            if (progress[componentTag]) {
                return;
            }

            progress[componentTag] = 'progress';

            const componentMeta = await cache.get(componentTag);

            if (!componentMeta) {
                // eslint-disable-next-line no-console
                console.error('Cache without meta', cache._cache);
                throw new Error(`No meta in for ${componentTag} in cache`);
            }

            const dependencyTags = Object.entries(componentMeta.dependencies || {}).map(([type, version]) =>
                toTag(type, version)
            );

            progress[componentTag] = 'done';
            meta.push(componentMeta);

            for (const dependencyTag of dependencyTags) {
                process(dependencyTag);
            }

            if (Object.values(progress).every((status) => status === 'done')) {
                resolve(meta);
            }
        };

        Promise.all(initialTags.map(process)).catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            throw err;
        });
    });
