import { ComponentMeta, Lock } from '../providerDomain';
import { flattenDependencyTree } from '../utils/flattenDependencyTree';
import { getNotCachedLock, lock2Tags } from '../utils/getNotCachedLock';
import { toTag } from '../utils/tag';
import { RegistryProviderOptions } from './options';

const callServerResolve = async (lock: Lock, registryUrl: string, registryPrereleaseTag: string) => {
    const normalizedUrl = registryUrl.replace(/\/$/g, '');
    const queryParams = registryPrereleaseTag ? `?prerelease=${registryPrereleaseTag}` : '';

    const response = await fetch(`${normalizedUrl}/resolve${queryParams}`, {
        method: 'POST',
        body: JSON.stringify(lock),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data: { found: ComponentMeta[] } = await response.json();

    const loadedMeta: { [tag: string]: ComponentMeta } = {};

    for (const componentMeta of data.found) {
        const tag = toTag(componentMeta.type, componentMeta.version);

        loadedMeta[tag] = componentMeta;
    }

    return loadedMeta;
};

const resolveMissingComponents = async (lock: Lock, { metaCache, ...apiOptions }: RegistryProviderOptions) => {
    const lockToResolve = getNotCachedLock(lock, metaCache);

    if (Object.keys(lockToResolve).length === 0) {
        return;
    }

    if (!('core' in lockToResolve)) {
        lockToResolve.core = lock.core;
    }

    const metaReceivedFromServer = callServerResolve(
        lockToResolve,
        apiOptions.registryUrl,
        apiOptions.registryPrereleaseTag
    );

    // create a separate promise for each component in the lock and add it to the cache, so it can be reused while component loads
    for (const [type, version] of Object.entries(lockToResolve)) {
        const tag = toTag(type, version);

        metaCache.maybeAdd(
            tag,
            metaReceivedFromServer.then((loadedMeta) => loadedMeta[tag])
        );
    }

    // add dependencies that were not in the lock to the cache (like transitive dependencies)
    Object.entries(await metaReceivedFromServer).forEach(([tag, componentMeta]) => {
        metaCache.maybeAdd(tag, Promise.resolve(componentMeta));
    });
};

// @internal
export const getComponentsMeta = async (lock: Lock, options: RegistryProviderOptions) => {
    const lockTags = lock2Tags(lock);

    await resolveMissingComponents(lock, options);

    const componentsMeta = await flattenDependencyTree(lockTags, options.metaCache);

    return componentsMeta;
};
