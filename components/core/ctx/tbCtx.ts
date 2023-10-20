import { action, observable, runInAction, toJS } from 'mobx';
import { IntlShape } from 'react-intl';
import { PopperProps } from 'react-popper';

import { getByPath } from '../access/getByPath';
import { setByPath } from '../access/setByPath';
import { ActionMatcher, makeActionMatcher } from '../api/actionMatcher';
import { ActionDesc, AnyAction, GettableAction } from '../api/helpers/action';
import { PluginCompiled } from '../api/helpers/plugin';
import { TbConfig } from '../compileConfig/compileConfig';
import { CoreApi } from '../coreApi';
import { resolveGetters } from '../resolveGetters/resolveGetters';
import { Tb } from '../Tb/Tb';
import { addProxy } from './actionPopulate';
import { CtxBag, makeCtxBag } from './ctxBag';
import { Form, makeForm } from './form';
import { initLifeCycle } from './lifeCycle/lifeCycle';
import { TbNode } from './lifeCycle/lifeCycleTypes';

type Listener = (action: AnyAction) => void;
export type WritableForm = 'output' | 'internal' | 'mounted';
export type RawValue = { raw: unknown; computedParsed: unknown };

export interface TbCtx {
    // input data
    input: any;

    // editable data
    output: Form;
    internal: Form;
    touchOnChange: boolean;

    hintPosition?: PopperProps<unknown>['placement'];
    // action management
    actionListeners: ActionMatcher<Listener>;
    dispatch: (action: GettableAction, bag: CtxBag) => void;

    // lifecycle
    viewState: { [nodeKey: string]: unknown }; // nodeKey -> view state
    rawNodeValue: { [nodeKey: string]: RawValue | undefined };
    tree: TbNode | undefined;
    viewKey2NodeKey: {
        [viewKey: string]: string;
    };
    plugins: PluginCompiled[];

    // validation & error display
    isValid: boolean;
    isTouched: boolean;
    showAllErrors: boolean;
    submit: () => Form['value'];
    closeAllPopups: () => void;

    // focus management
    isFocused: boolean;

    // configuration
    config: TbConfig;
    isReadOnly: boolean;

    destroy: () => void;

    Component: CoreApi['Tb'];

    intl: IntlShape;
}

const isSubTreeValid = (node: TbNode): boolean => {
    if (node.destroyed) {
        return true;
    }

    if (node.validationError) {
        return false;
    }

    return Object.values(node.children).every(isSubTreeValid);
};

export const actionMap: { [type: string]: ActionDesc<any> } = {};
const isTouched = (form: Form) => Object.keys(form.touched).length > 0;

export const makeEmptyCtx = (): TbCtx => {
    const ctx: TbCtx = observable<TbCtx>(
        {
            input: {},

            output: makeForm(),
            internal: makeForm(),
            touchOnChange: true,

            actionListeners: makeActionMatcher<Listener>([]),
            dispatch: (action: GettableAction, bag: CtxBag) => {
                // action can be called async (like in React.useEffect or after network request) by that time ctx might be destroyed already
                if (ctx.tree?.destroyed) {
                    return;
                }

                // prepare
                const resolvedAction = resolveGetters(action, bag);

                if (!resolvedAction) {
                    return;
                }

                // match with listeners
                const listener = ctx.actionListeners.match(resolvedAction, bag);

                if (listener) {
                    listener(resolvedAction);
                }

                // apply
                const actionDesc = actionMap[resolvedAction.type];

                if (
                    actionDesc &&
                    actionDesc.apply &&
                    (!actionDesc.uses.includes('data' as any) || !bag.tb.isReadOnly)
                ) {
                    const withProxy = addProxy(resolvedAction, bag);

                    const apply = actionDesc.apply;

                    runInAction(() => apply(withProxy));
                }
            },

            viewState: observable<TbCtx['viewState']>({}, undefined, { deep: false }),
            rawNodeValue: observable<TbCtx['rawNodeValue']>({}, undefined, { deep: false }), // insides are not observable by design
            tree: undefined,
            viewKey2NodeKey: {},
            plugins: [],

            get isValid() {
                return Boolean(ctx.tree && isSubTreeValid(ctx.tree));
            },
            get isTouched() {
                return isTouched(ctx.output) || isTouched(ctx.internal);
            },
            showAllErrors: false,
            submit: () => {
                ctx.showAllErrors = true;

                return toJS(ctx.output.value);
            },
            closeAllPopups: action(() => {
                Object.values(ctx.viewState).forEach((viewState) => {
                    if (typeof viewState === 'object' && viewState) {
                        const state = viewState as { isOpen?: boolean; openType?: string };

                        if (state.isOpen && state.openType !== 'collapse') {
                            state.isOpen = false;
                        }
                    }
                });
            }),

            // focus management
            isFocused: false,

            config: undefined as any,
            isReadOnly: false,

            destroy: () => {
                ctx.plugins.forEach((plugin) => plugin && plugin.destroy && plugin.destroy());
                if (ctx.tree) {
                    ctx.tree.destroy();
                }
            },

            Component: Tb,

            intl: undefined as any
        },
        undefined,
        { deep: false }
    );

    return ctx;
};

export const initCtx = (ctx: TbCtx, config: TbConfig, input: TbCtx['input'], intl: TbCtx['intl']) => {
    const bag = makeCtxBag(ctx);

    ctx.config = config;
    ctx.input = input;
    ctx.intl = intl;
    ctx.plugins = config.plugins.map((plugin) => plugin.init(bag)).filter(Boolean);

    initLifeCycle(ctx);
};

const touchOutput = (ctx: TbCtx, path: string) => {
    const value: unknown = path ? getByPath(ctx.output.value, path) : ctx.output.value;

    if (typeof value === 'undefined') {
        return;
    }

    if (path) {
        setByPath(ctx.output.touched, path, true);
    }

    if (typeof value === 'object' && value) {
        if (Array.isArray(value)) {
            value.forEach((_, idx) => touchOutput(ctx, path ? `${path}.${idx}` : idx.toString()));
        }

        Object.keys(value).forEach((key) => touchOutput(ctx, path ? `${path}.${key}` : key));
    }
};

// for old launchers
export const makeCtx = (config: TbConfig, input: TbCtx['input'], output?: TbCtx['output']['value']) => {
    const ctx = makeEmptyCtx();

    if (output) {
        ctx.output.value = output;
        runInAction(() => touchOutput(ctx, ''));
    }

    initCtx(ctx, config, input, undefined as any);

    return ctx;
};

export const makeCtxV2 = (
    config: TbConfig,
    input: TbCtx['input'],
    intl: TbCtx['intl'],
    output?: TbCtx['output']['value']
) => {
    const ctx = makeEmptyCtx();

    if (output) {
        ctx.output.value = output;
        runInAction(() => touchOutput(ctx, ''));
    }

    initCtx(ctx, config, input, intl);

    return ctx;
};
