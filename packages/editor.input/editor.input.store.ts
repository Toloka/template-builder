import { EditorInstance } from '@toloka-tb/editor.monaco';
import { parseJSON } from '@toloka-tb/lang.json';
import { observable } from 'mobx';

import { FindableErrors, PlainError, toFindableErrors } from './toFindableErrors';

export type ParseSuccess = {
    state: 'parsed';
    value: object;
};
export type ParseErrors = {
    state: 'error';
    errors: FindableErrors;
};
export type InputStore = {
    text: string;
    editor: EditorInstance | undefined;
    readonly parse: ParseSuccess | ParseErrors;
};

const validate = (inputStore: InputStore): PlainError[] => {
    if (inputStore.text.trim().length === 0) {
        return [
            {
                from: 0,
                error: 'error.emptyInputExample'
            }
        ];
    }

    try {
        const { meta, value } = parseJSON(inputStore.text);

        if (meta.errors.length > 0) {
            return meta.errors;
        }

        if (!value || value.type !== 'object') {
            return [
                {
                    from: 0,
                    error: 'error.inputMustBeObject'
                }
            ];
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);

        return [
            {
                from: 0,
                error: err.message || 'error.unknown'
            }
        ];
    }

    return [];
};

export const createInputStore = (initialValue: object) => {
    const inputStore: InputStore = observable({
        text: JSON.stringify(initialValue, null, 4),
        editor: undefined,
        get parse(): InputStore['parse'] {
            const markers = validate(inputStore);

            if (markers.length > 0) {
                return {
                    state: 'error',
                    errors: toFindableErrors(markers, inputStore)
                };
            }

            return {
                state: 'parsed',
                value: JSON.parse(inputStore.text)
            };
        }
    });

    return inputStore;
};
