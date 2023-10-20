import { getByPath } from '../access/getByPath';
import { setByPath } from '../access/setByPath';
import { CtxBag } from '../ctx/ctxBag';
import { DataRW } from './rw';
import {
    applyDefault,
    isValueInUse,
    joinDataPath,
    normalizeTouched,
    setValueInUse,
    usageApplicationMock
} from './utils';

type ValueMapper = <T extends any>(value: T, bag: CtxBag) => T;
type PathMapper = (basePath: string, bag: CtxBag) => string[];

export const dataMap = <T, BaseT extends T>({
    base,
    mapValue,
    mapPaths
}: {
    base: DataRW<BaseT>;
    mapValue: ValueMapper;
    mapPaths: PathMapper;
}): DataRW<T> => {
    const data: DataRW<T> = {
        __dataType: 'data.map',
        __tbGettable: true,
        getPath: (bag) => base.getPath(bag),
        getForm: (bag) => base.getForm(bag),
        get: (bag) => {
            const baseValue = base.get(bag);

            return mapValue(baseValue, bag) as T;
        },
        set: (value: T, basePath: string, bag: CtxBag) => {
            if (bag.tb.isReadOnly) return;

            const baseValue = mapValue(value, bag);
            const subPaths = mapPaths('', bag);

            if (typeof baseValue === 'object' && baseValue !== null) {
                for (const subPath of subPaths) {
                    const value = getByPath(baseValue, subPath);
                    const path = joinDataPath(basePath, subPath);

                    base.set(mapValue(value, bag) as BaseT, path, bag);
                }
            } else {
                base.set(mapValue(value, bag) as BaseT, basePath, bag);
            }
        },
        makeProxy: (bag) => {
            const proxy = {
                get value() {
                    return data.get(bag);
                },
                set value(newValue) {
                    data.set(newValue, data.getPath(bag), bag);
                }
            };

            return proxy;
        },
        getDefault: (bag) => mapValue(base.getDefault(bag), bag) as T,
        applyDefault: (bag: CtxBag) => applyDefault(bag, data.getForm(bag), data.getPath(bag), data.getDefault(bag)),
        getTouched: (bag: CtxBag) => {
            const baseTouched = base.getTouched(bag);

            return normalizeTouched(mapValue<any>(baseTouched, bag));
        },
        isValueInUse: (bag: CtxBag) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return true;

            return isValueInUse(bag.tb[formName], data.getPath(bag));
        },
        setValueInUse: (bag: CtxBag) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return usageApplicationMock;

            const basePath = data.getPath(bag);
            const paths = mapPaths(basePath, bag);

            const subUsages = paths.map((path) => setValueInUse(bag.tb[formName], path));

            return {
                cancel: () => subUsages.forEach((usage) => usage.cancel())
            };
        },
        bury: (bag, providedPath) => {
            const baseValue = mapValue(data.get(bag), bag);
            const basePath = providedPath || data.getPath(bag);
            const subPaths = mapPaths('', bag);
            const formName = data.getForm(bag);

            if (formName === 'mounted') return;
            const form = bag.tb[formName];

            for (const subPath of subPaths) {
                const value = getByPath(baseValue, subPath);
                const path = joinDataPath(basePath, subPath);

                if (!isValueInUse(form, path) && typeof value !== 'undefined') {
                    setByPath(form.graveyard, path, value);
                    data.set(undefined as any, subPath, bag);
                }
            }
        },
        resurrect: (bag) => {
            const formName = data.getForm(bag);
            const basePath = data.getPath(bag);
            const paths = mapPaths(basePath, bag);

            if (formName === 'mounted') return;

            const form = bag.tb[formName];

            for (const path of paths) {
                const value = getByPath(form.graveyard, path);

                if (!isValueInUse(form, path) && typeof value !== 'undefined') {
                    data.set(value, path, bag);
                    setByPath(form.graveyard, path, undefined);
                }
            }
        }
    };

    return data as DataRW<any>;
};
