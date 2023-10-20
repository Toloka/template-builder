import * as React from 'react';
const initValue = {};

export const useCache = <T>(get: () => T, isEqual: (oldValue: T, newValue: T) => boolean) => {
    const newValue = get();
    const stored = React.useRef<T | typeof initValue>(initValue);

    if (stored.current === initValue) {
        stored.current = newValue;
    } else if (!isEqual(stored.current as T, newValue)) {
        stored.current = newValue;
    }

    return stored.current as T;
};
