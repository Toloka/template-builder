import { CtxBag } from '../../ctx/ctxBag';
import { actionMap } from '../../ctx/tbCtx';
import { DataRW, InferProxy } from '../../data/rw';
import { Compile, compiler, Getter, makeGetter, resolveGetters } from '../../resolveGetters/resolveGetters';
import { ViewConfig } from './view';

type Parameters<T> = T extends (...args: infer A) => any ? A : never;

// ForcePayload is a specific hack for unknown payloads, as in ActionSet, most wouldn't need it
export type Action<T = string, P = unknown, ForcePayload = false> = {
    type: T;
} & (unknown extends P
    ? true extends ForcePayload
        ? { payload: P }
        : {}
    : undefined extends P
    ? { payload?: Exclude<P, undefined> }
    : { payload: P });

export type GettableAction<T = string, P = unknown, ForcePayload = false> =
    | Getter<Action<T, P, ForcePayload>>
    | Action<T, P, ForcePayload>;

export type ViewAction<T = string, P = unknown, ForcePayload = false> = Action<T, P, ForcePayload> & {
    view: ViewConfig;
};
export type DataAction<T = string, D = any, P = unknown, ForcePayload = false> = Action<T, P, ForcePayload> & {
    data: DataRW<D>;
};

export type ContextualAction<T = string, P = unknown, ForcePayload = false> = Action<T, P, ForcePayload> & {
    ctxBag?: CtxBag;
};

export type AnyAction = Action & { data?: DataRW<any>; view?: ViewConfig; payload?: any };

export type ActionCreator =
    | Action
    | Getter<Action>
    | ((props: {
          view: any;
          data: any;
          payload: any;
          ctxBag?: CtxBag;
          isContextual?: true;
      }) => Getter<Action> | Action);

export type ActionCb<AC> = AC extends Function
    ? Parameters<AC>[0] extends { payload: unknown }
        ? (payload: Parameters<AC>[0]['payload']) => void
        : Parameters<AC>[0] extends { payload?: unknown }
        ? (payload?: Parameters<AC>[0]['payload']) => void
        : () => void
    : () => void;

export type ActionCreatorProps<AC> = { action: AC } & (AC extends Function
    ? Parameters<AC>[0] extends { payload: unknown }
        ? { payload: Parameters<AC>[0]['payload'] }
        : {}
    : {});

type ActionWithProxy<A> = A extends DataAction
    ? Omit<A, 'data'> & { data: InferProxy<A['data']> }
    : A extends ViewAction
    ? Omit<A, 'view'> & { view: { state: any; props: any } }
    : A;

export type ActionDesc<A extends Action> = {
    type: A['type'];
    uses: Array<keyof Omit<A, 'type'> | 'ctxBag'>;
    apply?: (action: ActionWithProxy<A>) => void;
};

export type ActionHelper = <A extends Action>(desc: ActionDesc<A>) => Compile<Omit<A, 'type'>, Getter<A>>;

export const actionHelper: ActionHelper = (desc) => {
    actionMap[desc.type] = desc;

    return compiler((props) =>
        makeGetter((ctxBag) => {
            const action: any = {
                type: desc.type,
                __tbCompiled: true
            };

            for (const key of desc.uses) {
                action[key] = (props as any)[key];
            }

            if (desc.uses.includes('ctxBag')) {
                action.isContextual = true;
                action.ctxBag = ctxBag;
            }

            if ((props as any).payload) {
                action.payload = resolveGetters(action.payload, ctxBag);
            }

            return action;
        })
    );
};
