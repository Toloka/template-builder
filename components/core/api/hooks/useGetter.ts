import { useObserver } from 'mobx-react-lite';
import React from 'react';

import { useCtxBag } from '../../ctx/nodeCtx';
import { Getter } from '../../resolveGetters/resolveGetters';

export const useGetter = <Props, T>(getterCreator: (props: Props) => Getter<T>, props: Props): T => {
    const ctxBag = useCtxBag();
    const getter = React.useMemo(() => getterCreator(props), [getterCreator, props]);

    return useObserver(() => getter.get(ctxBag));
};
