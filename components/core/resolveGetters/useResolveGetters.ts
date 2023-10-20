import { useObserver } from 'mobx-react-lite';

import { CtxBag } from '../ctx/ctxBag';
import { useCtxBag } from '../ctx/nodeCtx';
import { R, resolveGetters } from './resolveGetters';

export const useResolveGetters = <O = any, T = any>(toGet: R<T>, providedBag?: CtxBag): O => {
    const bag = useCtxBag();

    const values = useObserver(() => resolveGetters(toGet, providedBag || bag));

    return values;
};
