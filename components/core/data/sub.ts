import { getByPath } from '../access/getByPath';
import { register } from '../compileConfig/compileConfig';
import { CtxBag } from '../ctx/ctxBag';
import { resolveGetters } from '../resolveGetters/resolveGetters';
import { DataRW } from './rw';
import {
    applyDefault,
    isValueInUse,
    joinDataPath,
    normalizeTouched,
    setValueInUse,
    usageApplicationMock
} from './utils';

export const dataSub = <T>({ parent, path }: { parent: DataRW<unknown>; path: string }): DataRW<T> => {
    const data: DataRW<T> = {
        __dataType: 'data.sub',
        __tbGettable: true,
        getPath: (bag) => joinDataPath(parent.getPath(bag), resolveGetters(path, bag)),
        getForm: (bag) => parent.getForm(bag),
        get: (bag) => {
            const parentValue = parent.get(bag);

            if (!parentValue) return undefined as any;

            return getByPath(parentValue, resolveGetters(path, bag));
        },
        set: (value: T, path: string, bag: CtxBag) => {
            if (bag.tb.isReadOnly) return;

            parent.set(value, path, bag);
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
        getDefault: (bag: CtxBag) => {
            const parentDefault = parent.getDefault(bag);

            if (!parentDefault) return undefined;

            return getByPath(parentDefault, resolveGetters(path, bag));
        },
        applyDefault: (bag: CtxBag) => applyDefault(bag, data.getForm(bag), data.getPath(bag), data.getDefault(bag)),
        getTouched: (bag: CtxBag) => {
            const parentTouched = parent.getTouched(bag);

            return normalizeTouched(getByPath(parentTouched, resolveGetters(path, bag)));
        },
        isValueInUse: (bag: CtxBag) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return true;

            return isValueInUse(bag.tb[formName], data.getPath(bag));
        },
        setValueInUse: (bag: CtxBag) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return usageApplicationMock;

            return setValueInUse(bag.tb[formName], data.getPath(bag));
        },
        bury: (bag, providedPath) => parent.bury(bag, providedPath || resolveGetters(path, bag)),
        resurrect: (bag) => parent.resurrect(bag)
    };

    return data as DataRW<any>;
};

register({
    type: 'data.sub',
    compile: (props: { parent: DataRW<any>; path: string }) => dataSub(props)
});
