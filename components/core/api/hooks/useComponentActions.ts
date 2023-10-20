import * as React from 'react';

import { CtxBag } from '../../ctx/ctxBag';
import { useCtxBag } from '../../ctx/nodeCtx';
import { ActionCb, ActionCreator } from '../helpers/action';

const noop = () => {
    /* noop */
};

const createActionCb = <AC extends ActionCreator>(actionCreator: AC, ctxBag: CtxBag): ActionCb<AC> => {
    // this is impossible to type, but the interface works, so whatever
    if (typeof actionCreator === 'undefined') {
        return noop as any;
    }

    if (typeof actionCreator === 'object') {
        return (() => {
            ctxBag.tb.dispatch(actionCreator as any, ctxBag);
        }) as any;
    }

    return ((payload: any) => {
        const view = { ...ctxBag.component.view, __tbViewKey: ctxBag.component.__tbViewKey };

        ctxBag.tb.dispatch((actionCreator as any)({ payload, view, data: ctxBag.component.data } as any), ctxBag);
    }) as any;
};

type Mapped<AC extends ActionCreator[]> = { [K in keyof AC]: ActionCb<AC[K]> };

export const useComponentActions = <AC extends [ActionCreator, ...ActionCreator[]]>(
    actions: AC = [] as any
): Mapped<AC> => {
    const bag = useCtxBag();

    const callbacks = React.useMemo(() => {
        return actions.map((action) => createActionCb(action, bag));
        // disabled coz we care about contents of actions, not the array itself
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bag, ...actions]);

    return callbacks as any;
};
