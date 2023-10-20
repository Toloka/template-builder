import { JSONSchema7Definition } from 'json-schema';

import { getByPath } from '../access/getByPath';
import { CtxBag } from '../ctx/ctxBag';
import { Getter, resolveGetters } from '../resolveGetters/resolveGetters';

export type DataR<T = unknown> = Getter<T> & { getPath: (bag: CtxBag) => string; __dataType: string };

export interface DataRProps<T = undefined> {
    path: string;
    default?: T;
    schema?: JSONSchema7Definition;
}

export const dataInput = <T extends unknown>(props: DataRProps<T>): DataR<T> => {
    const data = {
        __dataType: 'data.input',
        __tbGettable: true,
        getPath: (bag: CtxBag) => {
            return resolveGetters(props.path, bag);
        },
        get: (bag: CtxBag): T => getByPath<T>(bag.tb.input, data.getPath(bag), resolveGetters(props.default, bag))
    } as const;

    return data;
};
