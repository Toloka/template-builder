import { Child } from './helpers/children';

export const childrenFromArray = (arr: Child[], prefix = '') => {
    const children: { [key: string]: Child } = {};

    for (let i = 0; i < arr.length; ++i) {
        children[`${prefix}${i}`] = arr[i];
    }

    return children;
};
