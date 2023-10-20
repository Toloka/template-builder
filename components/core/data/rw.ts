import { getByPath } from '../access/getByPath';
import { setByPath } from '../access/setByPath';
import { CtxBag } from '../ctx/ctxBag';
import { WritableForm } from '../ctx/tbCtx';
import { Getter, resolveGetters } from '../resolveGetters/resolveGetters';
import {
    applyDefault,
    isValueInUse,
    joinDataPath,
    normalizeTouched,
    setFormData,
    setValueInUse,
    Touched,
    usageApplicationMock
} from './utils';

export type DataRWProps<T> = {
    path: string;
    default?: T;
};

export type DataRW<T> = Getter<T> & {
    __dataType: string;
    set: (value: T, path: string, bag: CtxBag) => void;
    makeProxy: (bag: CtxBag) => DataProxy<T>;
    getPath: (bag: CtxBag) => string;
    getForm: (bag: CtxBag) => WritableForm;
    getDefault: (bag: CtxBag) => T | undefined;
    applyDefault: (bag: CtxBag) => void;
    getTouched: (bag: CtxBag) => Touched;
    isValueInUse: (bag: CtxBag, path?: string) => boolean;
    setValueInUse: (bag: CtxBag) => { cancel: () => void };
    bury: (bag: CtxBag, providedPath?: string) => void;
    resurrect: (bag: CtxBag) => void;
};

export type DataProxy<T> = { value: T };
export type InferProxy<D extends DataRW<any>> = D extends DataRW<infer T> ? DataProxy<T> : never;

const createRW = (form: WritableForm) => <T>(props: DataRWProps<T>): DataRW<T> => {
    const data: DataRW<T> = {
        __dataType: `data.${form}`,
        __tbGettable: true,
        getPath: (bag: CtxBag) => resolveGetters(props.path, bag),
        getForm: () => form,
        get: (bag: CtxBag) => getByPath(bag.tb, joinDataPath(form, 'value', data.getPath(bag))),
        set: (value: T, path: string, bag: CtxBag) => {
            if (bag.tb.isReadOnly) return;

            setFormData(bag, data.getForm(bag), path, value);
        },
        makeProxy: (bag: CtxBag) => {
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
        getDefault: (bag: CtxBag) => resolveGetters(props.default, bag),
        applyDefault: (bag: CtxBag) => applyDefault(bag, data.getForm(bag), data.getPath(bag), data.getDefault(bag)),
        getTouched: (bag: CtxBag) =>
            normalizeTouched(getByPath(bag.tb, joinDataPath(form, 'touched', data.getPath(bag)))),
        isValueInUse: (bag: CtxBag, path?: string) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return true;

            return isValueInUse(bag.tb[formName], path || data.getPath(bag));
        },
        setValueInUse: (bag: CtxBag) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return usageApplicationMock;

            return setValueInUse(bag.tb[formName], data.getPath(bag));
        },
        bury: (bag: CtxBag, providedPath?: string) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return;
            if (data.isValueInUse(bag, providedPath)) return;

            const form = bag.tb[formName];
            const path = providedPath || data.getPath(bag);
            const value = getByPath(bag.tb, joinDataPath(formName, 'value', path));

            setByPath(form.graveyard, path, value);

            data.set(undefined as any, path, bag);
        },
        resurrect: (bag: CtxBag) => {
            const formName = data.getForm(bag);

            if (formName === 'mounted') return;
            if (data.isValueInUse(bag)) return;

            const form = bag.tb[formName];
            const path = data.getPath(bag);
            const value = getByPath(form.graveyard, path);

            if (typeof value !== 'undefined') {
                data.set(value, path, bag);
                setByPath(form.graveyard, path, undefined);
            }
        }
    } as const;

    return data;
};

export const dataOutput = createRW('output');
export const dataInternal = createRW('internal');
