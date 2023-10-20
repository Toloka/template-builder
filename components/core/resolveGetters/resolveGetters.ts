import { mapObject } from '@toloka-tb/common/utils/mapObject';

import { Child } from '../api/helpers/children';
import { CtxBag } from '../ctx/ctxBag';

export interface Getter<T> {
    __tbGettable: true;
    get: (bag: CtxBag) => T;
}

export type R<T = unknown> = T | Getter<T>;

export type Compiled<T extends object> = T & { __tbCompiled: true; __configPath: '' };

export type Compile<T extends any, R extends object> = (props: T) => Compiled<R>;

export const makeGetter = <T>(getter: (bag: CtxBag) => T): Getter<T> => ({
    __tbGettable: true,
    get: getter
});

export const compiler = <T extends any[], R extends object>(core: (...args: T) => R) => (...args: T): Compiled<R> => {
    const compiled = (core(...args) as any) as Compiled<R>;

    compiled.__tbCompiled = true;

    return compiled;
};

export const resolveGetters = <O = any, T = any>(value: R<T>, bag: CtxBag): O => {
    if (!value) return value as any;

    if (typeof value === 'object') {
        if ('__tbGettable' in value) {
            return resolveGetters(value.get(bag), bag) as any;
        }

        if ('__tbView' in value) {
            const child = { config: value as any, bag, __tbCompiled: true } as Child;

            return child as any;
        }

        if ('__tbCompiled' in value) {
            return value as any;
        }

        if (Array.isArray(value)) {
            return value.map((x) => resolveGetters(x, bag)) as any;
        }

        if (typeof value === 'object') {
            return mapObject(value as any, (x) => resolveGetters(x, bag)) as any;
        }

        return value as any;
    }

    return value as any;
};
