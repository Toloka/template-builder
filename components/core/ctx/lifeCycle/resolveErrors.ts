import { computed } from 'mobx';

import { getByPath } from '../../access/getByPath';
import { ValidationError } from '../form';
import { TbNode } from './lifeCycleTypes';

const aside = (str: string, pad: number) => str.padStart(str.length + pad, '\u00A0'); // nbsp

const stringifyValidationError = (error: ValidationError): string[] => {
    const errors: Array<{ error: ValidationError; prefix: string; depth: number }> = [{ error, prefix: '', depth: 0 }];
    const result = [];

    while (errors.length > 0) {
        const { error, prefix, depth } = errors.pop()!;

        if (error.message) {
            result.push(aside(`${prefix}${error.message}`, depth * 2));
        }
        const firstChildAsMessage = !error.message;

        errors.push(
            ...((error.children as any[]) || [])
                .map((child, i) => ({
                    error: child,
                    depth: firstChildAsMessage && !child.children ? depth : depth + 1,
                    prefix: firstChildAsMessage && i === 0 ? prefix : error.childrenSeparatePrefix || ''
                }))
                .reverse()
        );
    }

    return result;
};

const isFieldTouched = (node: TbNode) => {
    if (!('__tbField' in node.config)) {
        return false;
    }

    const path = node.config.data.getPath(node.bag);
    const form = node.config.data.getForm(node.bag);

    if (form === 'mounted') {
        const value = node.config.data.get(node.bag);

        return Boolean(getByPath(value, path));
    }

    const touched = Boolean(getByPath(node.bag.tb[form].touched, path));

    return touched;
};

const noErrors: Array<{ message: string }> = [];

const makeResolveErrors = (node: TbNode) =>
    computed(() => {
        const validationInlineErrors = node.validationError
            ? stringifyValidationError(node.validationError).map((line) => ({ message: line }))
            : [];

        return validationInlineErrors;
    });

const makeTouchedGetter = (node: TbNode) =>
    computed(() => {
        // touched field, or forced error state onto itself, or had error on submit
        const touched = isFieldTouched(node) || node.bag.showAllErrors || node.bag.tb.showAllErrors;

        return touched;
    });

export const noErrorsGetter = computed(() => noErrors);
export const makeErrorsGetter = (node: TbNode) => {
    const touched = makeTouchedGetter(node);
    const errors = makeResolveErrors(node);

    return computed(() => {
        const currentErrors = errors.get();

        if (touched.get() && currentErrors.length > 0) {
            return currentErrors;
        }

        return noErrors;
    });
};
