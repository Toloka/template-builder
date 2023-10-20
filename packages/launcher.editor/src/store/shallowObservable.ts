import { observable } from 'mobx';

export const shallowObservable = <T extends object>(obj: T) => observable(obj, undefined, { deep: false });
