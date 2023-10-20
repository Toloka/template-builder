import { reaction } from 'mobx';

import { InputStore } from './editor.input.store';
import translations from './i18n/editor.input.translations';

export type PlainError = { from: number; error: keyof typeof translations.ru };

const eventually = <T extends any>(getValue: () => T, action: (value: Exclude<T, null | undefined>) => void) => {
    const initialValue = getValue();

    if (initialValue) action(initialValue as any);

    const dispose = reaction(getValue, (value) => {
        if (value) {
            action(value as any);
            dispose();
        }
    });
};

const goToErrorInEditor = (row: number, col: number, store: InputStore) => {
    eventually(
        () => store.editor,
        (monaco) => {
            monaco.setPosition({
                column: col,
                lineNumber: row
            });
            monaco.focus();
            monaco.revealLineInCenter(row);
        }
    );
};

const getLocation = (error: PlainError, store: InputStore) => {
    const model = store.editor?.getModel();

    if (!model) {
        const text = store.text;
        let position = 0;
        let line = 0;

        while (text.indexOf('\n', position) < error.from && text.indexOf('\n', position) > -1) {
            position = text.indexOf('\n', position) + 1;
            ++line;
        }

        return {
            lineNumber: line + 1, // monaco counts lines form 1
            column: error.from - position + 1 // monaco counts columns form 1
        };
    }

    return model.getPositionAt(error.from);
};

const origin = 'input';

export const toFindableErrors = (errors: PlainError[], store: InputStore) => {
    return errors.map((tbError) => {
        const errorLocation = getLocation(tbError, store);

        return {
            message: tbError.error,
            getLocation: () => ({ origin, line: errorLocation?.lineNumber } as const),
            onClick: () => {
                if (errorLocation) {
                    goToErrorInEditor(errorLocation.lineNumber, errorLocation.column, store);
                }
            }
        };
    });
};

export type FindableErrors = ReturnType<typeof toFindableErrors>;
