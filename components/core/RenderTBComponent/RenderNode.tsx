import { mapObject } from '@toloka-tb/common/utils/mapObject';
import { useObserver } from 'mobx-react-lite';
import * as React from 'react';

import { TbNode } from '../ctx/lifeCycle/lifeCycleTypes';
import { nodeCtx } from '../ctx/nodeCtx';
import { InlineErrors } from '../Error/InlineErrors';
import { RenderTBComponent } from './RenderTBComponent';
import { ViewLabel } from './ViewLabel';

const ensureLabelString = (componentProps: any) => {
    componentProps.label = typeof componentProps.label === 'undefined' ? undefined : String(componentProps.label);
};

export const RenderNode: React.FC<{ node: TbNode }> = (props) => {
    const node = props.node;
    const Component = node.config.component;

    const children = useObserver(() =>
        mapObject(node.children, (child, key) => <RenderTBComponent node={child} key={key} />)
    );
    const componentProps = useObserver(() => ({ ...node.props, children }));
    const errors = useObserver(() => node.errors);
    const hintPosition = useObserver(() => node.bag.tb.hintPosition);

    ensureLabelString(componentProps);

    return (
        <nodeCtx.Provider value={node}>
            <ViewLabel viewProps={componentProps as any} config={node.config} hintPosition={hintPosition} />
            <Component {...componentProps} />
            <InlineErrors errors={errors} dir={(componentProps as any).rtl?.mode} />
        </nodeCtx.Provider>
    );
};
RenderNode.displayName = 'tb.Node';
