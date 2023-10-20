/* eslint-disable max-depth */
import { action, observable, set } from 'mobx';

type ParentObjectStack = Array<{
    obj: any;
    propertyName: string;
}>;

const setValue = ({ obj, key, nextKey, val }: { obj: any; key: string; nextKey: string | null; val: any }) => {
    if (nextKey !== null && nextKey === parseInt(nextKey, 10).toString() && !isNaN(parseInt(nextKey, 10))) {
        set(obj, key, Array(parseInt(nextKey, 10)).fill(undefined));
    } else {
        set(obj, key, val);
    }
};

const checkSubPathNecessity = (val: any, obj: any, key: string) =>
    !(
        typeof val === 'undefined' &&
        ((Array.isArray(obj) && obj.length <= parseInt(key, 10)) || typeof obj[key] === 'undefined')
    );

const createSubPath = (obj: any, key: string, nextKey: string | null) => {
    if (Array.isArray(obj) && obj.length >= parseInt(key, 10)) {
        const targetIndex = parseInt(key, 10);

        for (let index = obj.length; index <= targetIndex; index++) {
            obj.push(undefined);
        }
    }
    if (typeof obj[key] !== 'object') {
        setValue({ obj, key, nextKey, val: observable({}) });
    }
};

const checkPropertyMayBeRemoved = (obj: any, property: string) =>
    !Array.isArray(obj[property]) && (obj[property] === undefined || Object.keys(obj[property]).length === 0);

/* eslint-disable no-param-reassign */
export const setByPath = action('setByPath', (obj: any, parts: string | string[], val: any) => {
    const parsedParts = Array.isArray(parts) ? parts : parts.split('.');
    const parentsStack: ParentObjectStack = [];

    if (parts.length === 0) return;

    for (let i = 0; i < parsedParts.length - 1; i++) {
        const part = parsedParts[i];
        const nextPart = parsedParts[i + 1];

        parentsStack.push({
            obj,
            propertyName: part
        });

        if (!checkSubPathNecessity(val, obj, part)) {
            if (typeof val === 'undefined') {
                return;
            } else {
                break;
            }
        }

        createSubPath(obj, part, nextPart);

        obj = obj[part];
    }

    let key = parsedParts[parsedParts.length - 1];

    parentsStack.push({
        obj,
        propertyName: key
    });

    if (typeof val !== 'undefined') {
        setValue({ obj, key, nextKey: null, val });
    } else {
        let targetItemRemoved = false;

        while (parentsStack.length > 0) {
            const parent = parentsStack.pop();

            obj = parent!.obj;
            key = parent!.propertyName;
            if (!targetItemRemoved || checkPropertyMayBeRemoved(obj, key)) {
                if (Array.isArray(obj)) {
                    if (typeof obj[parseInt(key, 10)] !== 'undefined') {
                        set(obj, key, undefined);
                    }
                } else {
                    delete obj[key];
                }

                targetItemRemoved = true;
            } else {
                break;
            }
        }
    }
});
