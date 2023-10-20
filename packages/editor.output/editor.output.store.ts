import { action, observable } from 'mobx';

export type OutputStore = {
    value?: object;
    expired: boolean;
};
export const createOutputStore = (initialValue: OutputStore['value']) => {
    const outputStore: OutputStore = observable(
        {
            value: initialValue,
            expired: false
        },
        undefined,
        { deep: false }
    );

    return outputStore;
};

export const setValue = action((store: OutputStore, newValue: OutputStore['value']) => {
    store.value = newValue;
    store.expired = false;
});

export const expire = action((store: OutputStore) => {
    store.expired = true;
});
