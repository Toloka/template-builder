type Keys = string | string[];
type Action = 'keypress' | 'keydown' | 'keyup';

export const addGlobalBinds = (mousetrap: MousetrapStatic) => {
    const globals = new Set();
    const originalCB = mousetrap.prototype.stopCallback;

    mousetrap.bindGlobal = (keys: Keys, cB: (e: ExtendedKeyboardEvent, combo: string) => any, action: Action) => {
        mousetrap.bind(keys, cB, action);

        if (Array.isArray(keys)) {
            for (const k of keys) globals.add(k);
        } else globals.add(keys);
    };

    mousetrap.prototype.unbindGlobal = (keys: Keys, action: Action) => {
        mousetrap.unbind(keys, action);

        if (Array.isArray(keys)) {
            for (const k of keys) globals.delete(k);
        } else globals.delete(keys);
    };

    mousetrap.prototype.stopCallback = (
        e: ExtendedKeyboardEvent,
        element: HTMLInputElement,
        combo: string,
        sequence: string
    ) => {
        const isEnter = e.code === 'Enter';
        const isTextInput = ['text', 'textarea'].includes(element.type);

        if (globals.has(combo) || (globals.has(sequence) && !isTextInput) || isEnter) return false;

        return originalCB(e, element, combo, sequence);
    };
};
