import { parseJSON } from '@toloka-tb/lang.json';
import { action, observable, reaction } from 'mobx';
import { editor } from 'monaco-editor';

import { Marker } from '../components/Editor/lang/services/validation/validationTypes';
import { editorI18n } from '../i18n/editorI18n';
import { TbError } from './configStore';
import { defaultInput } from './defaults';
import { shallowObservable } from './shallowObservable';

export type InputState = {
    current: string;
    isDirty: boolean;

    valid: object;

    monaco: editor.ICodeEditor | null;
    monacoModel: editor.IModel | null;

    nextValidationErrors: Marker[];
    errors: {
        validation: Marker[];
        parsing: string | undefined;
    };
    relevantErrors: TbError[];
};

const privateInputStore = shallowObservable({
    current: JSON.stringify(defaultInput(), null, 2)
});

export const inputStore = shallowObservable<InputState>({
    valid: defaultInput(),
    isDirty: false,

    get current() {
        return privateInputStore.current;
    },
    set current(newValue) {
        if (newValue === privateInputStore.current) return;

        inputStore.isDirty = true;
        privateInputStore.current = newValue;
    },

    nextValidationErrors: [], // so we can updated errors synchronously with parsing
    errors: observable({
        validation: [], // = nextValidationErrors, when parsing is attempted
        parsing: undefined
    }),
    get relevantErrors(): TbError[] {
        const errors = inputStore.errors;

        if (errors.validation.length) {
            return errors.validation.map((marker) => ({ message: marker.message, location: marker.from }));
        }
        if (errors.parsing) return [{ message: errors.parsing }];

        return [];
    },

    monaco: null,
    monacoModel: null
});

const noVisibleText = /^\s*$/g;

const runValidation = action((text: string) => {
    const markers: Marker[] = [];

    if (noVisibleText.test(text)) {
        markers.push({
            from: 0,
            to: 1,
            message: editorI18n.t('error.emptyInputExample')
        });
    } else {
        try {
            const { meta, value } = parseJSON(text);

            if (!value) {
                // just skip to parsing errors form meta
            } else if (value.type !== 'object') {
                markers.push({
                    from: 0,
                    to: text.length,
                    message: editorI18n.t('validation.rootMusBeObject')
                });
            }

            meta.errors.forEach((err) => {
                markers.push({
                    from: err.from,
                    to: err.to,
                    message: editorI18n.t(err.error)
                });
            });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);

            markers.push({
                from: 0,
                to: text.length,
                message: err.message || editorI18n.t('preview.unknownError')
            });
        }
    }

    if (markers.length) {
        inputStore.nextValidationErrors = markers;
    } else {
        if (inputStore.nextValidationErrors.length > 0) {
            inputStore.nextValidationErrors = [];
        }
    }
    if (inputStore.isDirty) {
        inputStore.isDirty = false;
    }
});

editorI18n.on('loaded', () => {
    reaction(() => inputStore.current, runValidation, { fireImmediately: true });
});
