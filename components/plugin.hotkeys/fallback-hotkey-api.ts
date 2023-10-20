import { CreateOptions } from '@toloka-tb/core/coreComponentApi';
import ru from 'convert-layout/ru';
import mousetrap from 'mousetrap';

import { addGlobalBinds } from './addGlobalBinds';

export const fallbackHotkeyApi = (options: CreateOptions, allowHotkeysInInputs?: boolean) => {
    const handlers: { [sequence: string]: Array<() => void> | undefined } = {};

    const callHandlers = (sequence: string) => (event: KeyboardEvent) => {
        event.preventDefault();
        handlers[sequence]!.forEach((x) => x());
    };

    if (allowHotkeysInInputs) {
        addGlobalBinds(mousetrap);
    }

    const addHotkeyListener = (sequence: string, cb: () => void) => {
        if (/^[a-z]$/.test(sequence)) {
            // bind to russian keys too
            addHotkeyListener(ru.fromEn(sequence), cb);
        }

        if (!handlers[sequence]) {
            handlers[sequence] = [];
            if (allowHotkeysInInputs) {
                mousetrap.bind('enter', () => {
                    if (options.env.submit) {
                        options.env.submit();
                    }
                });
                mousetrap.bindGlobal(sequence, callHandlers(sequence));
            } else {
                mousetrap.bind(sequence, callHandlers(sequence));
            }
        }

        handlers[sequence]!.push(cb);

        return () => {
            const idx = handlers[sequence]!.indexOf(cb);

            if (idx !== -1) {
                handlers[sequence]!.splice(idx, 1);
            }
        };
    };

    return addHotkeyListener;
};
