import { getByPath } from '../access/getByPath';
import { CtxBag, noData } from '../ctx/ctxBag';
import { resolveGetters } from '../resolveGetters/resolveGetters';
import { SpyedData } from './local';
import { DataRW, DataRWProps } from './rw';
import { applyDefault, isValueInUse, normalizeTouched, setValueInUse, usageApplicationMock } from './utils';

const getParentData = (bag: CtxBag) => [...bag.data.relative].pop() || noData;
const getParentBag = (bag: CtxBag): CtxBag => {
    const relative = bag.data.relative.slice(0, -1);

    return { ...bag, data: { ...bag.data, relative } };
};

export type DataRelative<T> = DataRW<T> & SpyedData<T>;

export const dataRelative = <T>(props: DataRWProps<T>): DataRelative<T> => {
    const data: DataRelative<T> = {
        __tbGettable: true,
        __dataType: 'data.relative',
        __spying: {
            spiers: [],
            spy: (cb) => {
                data.__spying.spiers.push(cb);

                return () => (data.__spying.spiers = data.__spying.spiers.filter((spier) => spier !== cb));
            }
        },
        getPath: (bag: CtxBag) => {
            const parentData = getParentData(bag);
            const parentBag = getParentBag(bag);
            const parentPath = parentData.getPath(parentBag);

            if (props.path) {
                return `${parentPath}.${resolveGetters(props.path, bag)}`;
            } else {
                return parentPath;
            }
        },
        getForm: (bag: CtxBag) => {
            const parentData = getParentData(bag);
            const parentBag = getParentBag(bag);

            return parentData.getForm(parentBag);
        },
        get: (bag: CtxBag): T => {
            const parentData = getParentData(bag);
            const parentBag = getParentBag(bag);
            const parentValue = parentData.get(parentBag);

            const path = resolveGetters(props.path || '', bag);
            const value = path ? getByPath(parentValue, path) : parentValue;

            data.__spying.spiers.forEach((spier) => spier(parentValue as T, path));

            return value;
        },
        set: (value: T, path: string, bag: CtxBag) => {
            if (bag.tb.isReadOnly) return;

            const parentBag = getParentBag(bag);
            const parentData = getParentData(bag);

            parentData.set(value, path, parentBag);
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
        getTouched: (bag: CtxBag) => {
            const parentData = getParentData(bag);
            const parentBag = getParentBag(bag);
            const parentTouched = parentData.getTouched(parentBag);

            const path = resolveGetters(props.path || '', bag);

            return normalizeTouched(path ? getByPath(parentTouched, path) : parentTouched);
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
        bury: (bag, providedPath) => getParentData(bag).bury(getParentBag(bag), providedPath),
        resurrect: (bag) => getParentData(bag).resurrect(getParentBag(bag))
    };

    return data;
};
