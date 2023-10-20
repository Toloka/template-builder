import { action, observable } from 'mobx';

export type ValidationError = { message: string; childrenSeparatePrefix?: string; children?: ValidationError[] };

type Touched = { [key: string]: Touched | boolean };

export interface Form {
    value: {
        [key: string]: unknown | undefined;
    };
    touched: Touched;
    defaultApplied: Touched;

    valueUsage: {
        [path: string]: string[];
    };

    graveyard: Form['value'];
    clear: () => void;
}

export const makeForm = (): Form => {
    const form: Form = observable({
        value: {},
        touched: {},
        defaultApplied: {},
        valueUsage: {},

        // graveyard
        graveyard: {},
        clear: action(() => {
            form.value = {};
            form.touched = {};
            form.graveyard = {};
        })
    });

    return form;
};
