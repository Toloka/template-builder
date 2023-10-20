import { getByPath } from '../access/getByPath';
import { CtxBag } from '../ctx/ctxBag';
import { resolveGetters } from '../resolveGetters/resolveGetters';
import { DataR } from './input';

type Dispose = () => void;
export type SpyedData<T> = {
    __spying: {
        spiers: Array<(value: T, path: string) => void>;
        spy(cb: (value: T, path: string) => void): Dispose;
    };
};
export type DataLocal<T> = DataR<T> & SpyedData<T>;

export interface DataRProps<T = undefined> {
    path: string;
    default?: T;
}

export const dataLocal = <T extends unknown>(props: DataRProps<T>): DataLocal<T> => {
    const data: DataLocal<T> = {
        __tbGettable: true,
        __dataType: 'data.local',
        __spying: {
            spiers: [],
            spy: (cb) => {
                data.__spying.spiers.push(cb);

                return () => (data.__spying.spiers = data.__spying.spiers.filter((spier) => spier !== cb));
            }
        },
        getPath: () => props.path,
        get: (bag: CtxBag): T => {
            const path = resolveGetters(props.path, bag);

            data.__spying.spiers.forEach((spier) => spier(bag.data.local as T, path));

            const defaultValue = resolveGetters(props.default, bag);

            if (!path) {
                return typeof bag.data.local !== 'undefined' ? bag.data.local : defaultValue;
            }

            return getByPath<T>(bag.data.local, path, defaultValue);
        }
    };

    return data;
};
