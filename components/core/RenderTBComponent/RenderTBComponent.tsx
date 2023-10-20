import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import * as React from 'react';

import { TbNode } from '../ctx/lifeCycle/lifeCycleTypes';
import { RenderNode } from './RenderNode';

export const makeComponentId = () => uniqueId('ui-component');

const Guard: React.FC<{ node: TbNode }> = ({ node }) => {
    // TODO: do we really need this one?
    if (!node) return null;

    if (node && typeof node === 'object' && '__tbCompiled' in node.config) {
        return <RenderNode node={node} />;
    }

    const path = `#.${node.config.__configPath} (${(node.config.props as { type: string }).type})`;

    // TODO: improved this error
    // eslint-disable-next-line no-console
    console.error(`Component config in ${path} must be an object with "__tbCompiled" property, got`, node.config);
    throw new Error(
        `Component config in ${path} must be an object with "__tbCompiled" property, got \n${JSON.stringify(
            node.config,
            null,
            2
        )}\n[see full object in console above]`
    );
};

Guard.displayName = 'tb.Guard';

export const RenderTBComponent = React.memo(Guard);
