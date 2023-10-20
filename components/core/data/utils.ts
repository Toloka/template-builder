import { uniqueId } from '@toloka-tb/common/utils/uniqueId';

import { getByPath } from '../access/getByPath';
import { setByPath } from '../access/setByPath';
import { CtxBag } from '../ctx/ctxBag';
import { Form } from '../ctx/form';
import { WritableForm } from '../ctx/tbCtx';

export const setFormData = (bag: CtxBag, form: WritableForm, path: string, value: any) => {
    if (form === 'mounted') {
        throw new Error(`unable to setFormData on synthetic form (path: ${path})`);
    }

    setByPath(bag.tb[form].value, path, value);

    const touchedParts = [form, 'touched', path].filter(Boolean);
    const touchedPath = touchedParts.join('.');

    if (!getByPath(bag.tb, touchedPath) && bag.tb.touchOnChange) {
        setByPath(bag.tb, touchedPath, true);
    }
};

export const applyDefault = (bag: CtxBag, form: WritableForm, path: string, value: any) => {
    if (form === 'mounted') {
        throw new Error(`unable to applyDefault on synthetic form (path: ${path})`);
    }

    const alreadyApplied = getByPath(bag.tb[form].defaultApplied, path);
    const alreadyTouched = getByPath(bag.tb[form].touched, path);

    if (alreadyApplied || alreadyTouched) {
        return;
    }

    setByPath(bag.tb[form].defaultApplied, path, true);
    setByPath(bag.tb[form].value, path, value);
};

export const joinDataPath = (...parts: Array<string | number>) => parts.filter((part) => part !== '').join('.');

export const isValueInUse = (form: Form, path: string) => {
    const parts = path.split('.');

    for (let i = parts.length; i > 0; i--) {
        const subPath = parts.slice(0, i).join('.');

        const dataSubscribers = form.valueUsage[subPath];

        if (dataSubscribers && dataSubscribers.length > 0) {
            return true;
        }
    }

    return false;
};
export type ValueUsage = { cancel: () => void };
export const usageApplicationMock: ValueUsage = {
    cancel: () => {
        /* do notiong*/
    }
};

export const setValueInUse = (form: Form, path: string) => {
    if (path === '') {
        return usageApplicationMock;
    }

    const usageId = uniqueId('value-usage');

    form.valueUsage[path] = form.valueUsage[path] || [];
    form.valueUsage[path].push(usageId);

    return {
        cancel: () => {
            form.valueUsage[path] = form.valueUsage[path].filter((id) => id !== usageId);
        }
    };
};

export type Touched = boolean | { [key: string]: Touched };

export const normalizeTouched = (touched: Touched): Touched => {
    if (typeof touched !== 'object') return touched;

    return Object.values(touched).some(normalizeTouched);
};
