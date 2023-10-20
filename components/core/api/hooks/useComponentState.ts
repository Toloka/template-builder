import { autorun, IReactionDisposer, observable, toJS } from 'mobx';
import * as React from 'react';

import { useCtxBag } from '../../ctx/nodeCtx';

export const useComponentState = <T>(initial: T = undefined as any): T => {
    const [, forceRender] = React.useReducer((s) => s + 1, 0);
    const bag = useCtxBag();
    const key = bag.component.__tbViewKey;
    const viewStore = bag.tb.viewState;

    const disposeRef = React.useRef<IReactionDisposer>();

    React.useMemo(() => {
        if (disposeRef.current) {
            disposeRef.current();
            disposeRef.current = undefined;
        }

        let isFirstRender = true;

        if (typeof initial !== 'undefined') {
            viewStore[key] = typeof initial === 'object' ? observable(initial) : initial;
        }

        disposeRef.current = autorun(() => {
            toJS(viewStore[key]);
            if (!isFirstRender) {
                forceRender();
            }
            isFirstRender = false;
        });
        // to allow not plain literal initial value
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewStore, key]);

    React.useLayoutEffect(
        () => () => {
            if (disposeRef.current) {
                disposeRef.current();
            }
            // we only need this dispose on unmount, memo handles the rest
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        []
    );

    return viewStore[key] as T;
};
