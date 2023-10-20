import { mapObject } from '@toloka-tb/common/utils/mapObject';
import { Action, Core, CreateOptions, Plugin } from '@toloka-tb/core/coreComponentApi';
import { CtxBag } from '@toloka-tb/core/ctx/ctxBag';

type Dispose = () => void;
type AddHotkeyListener = (key: string, cb: () => void) => Dispose;
export type HotkeysEnvApi = {
    addHotkeyListener?: AddHotkeyListener;
};

export type PluginHotkeysProps = {
    [sequence: string]: Action;
} & { allowHotkeysInInputs: boolean };

let fallbackAddHotkeyListener: AddHotkeyListener;

const type = 'plugin.hotkeys';

export const setListeners = (
    options: CreateOptions,
    ctxBag: CtxBag,
    listeners: { [sequence: string]: (bag: CtxBag) => void },
    allowHotkeysInInputs?: boolean
) => {
    let isDestroyed = false;
    let disposers: Dispose[] = [];
    const registerAll = (addHotkeyListener: AddHotkeyListener) =>
        Object.entries(listeners).map(([sequence, handler]) =>
            addHotkeyListener(sequence, () => {
                if (ctxBag.tb.isFocused) {
                    handler(ctxBag);
                }
            })
        );

    if (options.env.addHotkeyListener && !allowHotkeysInInputs) {
        disposers = registerAll(options.env.addHotkeyListener);
    } else {
        import('./fallback-hotkey-api').then(({ fallbackHotkeyApi }) => {
            if (isDestroyed) return;
            if (!fallbackAddHotkeyListener) {
                fallbackAddHotkeyListener = fallbackHotkeyApi(options, allowHotkeysInInputs);
            }
            disposers = registerAll(fallbackAddHotkeyListener);
        });
    }

    return () => {
        disposers.forEach((dispose) => dispose());
        isDestroyed = true;
    };
};

export const create = (core: Core, options: CreateOptions) => {
    return {
        type,
        compile: core.helpers.plugin(
            (props: PluginHotkeysProps): Plugin => {
                return {
                    init: (ctxBag) => {
                        const bag = ctxBag;
                        const { allowHotkeysInInputs, ...hotkeys } = props;
                        const actions = Object.entries(hotkeys).map(([sequence, action]) => ({
                            matchingValue: sequence,
                            action,
                            bag
                        }));

                        const destroy = setListeners(
                            options,
                            ctxBag,
                            mapObject(hotkeys, (action) => (bag: CtxBag) => bag.tb.dispatch(action, bag)),
                            allowHotkeysInInputs
                        );

                        const matcher = core.makeActionMatcher(actions);

                        return {
                            name: 'hotkeys',
                            type: 'action',
                            match: matcher.match,
                            destroy
                        };
                    }
                };
            }
        )
    };
};
