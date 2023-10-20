import { computed } from 'mobx';
import { useObserver } from 'mobx-react-lite';
import * as React from 'react';

import { TbNode } from './lifeCycle/lifeCycleTypes';

export const nodeCtx = React.createContext<TbNode>(undefined as any);

export const useCtxBag = () => {
    const node = React.useContext(nodeCtx);

    const nodeExtendedBag = React.useMemo(
        () =>
            computed(() => ({
                ...node.bag,
                nodeKey: node.key
            })),
        [node]
    );

    const bag = useObserver(() => nodeExtendedBag.get());

    return bag;
};
