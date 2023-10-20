import { Lock, MetaCache } from '../providerDomain';
import { tagToType, toTag } from './tag';

// @internal
export const lock2Tags = (lock: Lock) => Object.entries(lock).map(([type, version]) => toTag(type, version));

// @internal
export const getNotCachedLock = (lock: Lock, metaCache: MetaCache) => {
    const tagsToResolve = lock2Tags(lock).filter((tag) => !metaCache.get(tag)); // reuse already requested dependencies from cache

    // use registry to /resolve the rest
    const typesToResolve = tagsToResolve.map(tagToType);
    const lockToResolve: Lock = {};

    for (const type of typesToResolve) {
        lockToResolve[type] = lock[type];
    }

    return lockToResolve;
};
