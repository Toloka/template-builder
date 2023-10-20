import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { Core } from '@toloka-tb/core/coreComponentApi';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { actionCreators } from '../ctx/hotkeysIntegration';
import { anyTarget, makeAction } from '../ctx/makeAction';
import { Control } from '../ui/Controls';

const selectMode = 'select';

const DefaultIcon = makeIcon(
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(940,570) scale(-0.08 ,-0.08)">
        <path d="M4812.3,3249.8C2280.9,2250.8,314.1,1444.3,239.6,1363.6c-186.1-173.7-186.1-446.7,0-620.4c74.5-74.5,912.1-508.8,1855.2-974.1l1712.4-843.8l850-1718.6c465.3-943.1,905.9-1780.7,974.1-1855.2c161.3-167.5,421.9-186.1,595.6-31C6369.7-4561.6,9900,4341.8,9900,4571.3c0,198.6-273,440.5-477.8,434.3C9329.2,4999.4,7250.7,4211.5,4812.3,3249.8z M8535,3609.6c0-37.2-2605.9-6682.2-2630.7-6707c-6.2-12.4-322.6,601.8-694.9,1352.6L4533.1-367.4L3149.5,321.2c-1054.8,521.2-1358.8,694.9-1271.9,732.1c353.7,155.1,6570.5,2593.5,6614,2593.5C8516.4,3646.9,8535,3628.3,8535,3609.6z" />
    </g>,
    'SelectIcon',
    {
        viewBox: '0 0 1000 1000'
    }
);

export const Default: React.FC<{ core: Core; ctx: AnnotationContext }> = observer(({ core, ctx }) => (
    <Control
        Icon={DefaultIcon}
        checked={ctx.actions.mode === selectMode}
        onClick={() => ctx.actions.toggleMode(ctx, selectMode)}
        tooltip={ctx.t('selectMode')}
        action={actionCreators.toggleMode}
        payload={selectMode}
        core={core}
    />
));

const resetSelection = action((ctx: AnnotationContext) => {
    ctx.selection.selectedVertexId = undefined;
    ctx.selection.selectedShapeId = undefined;
});

export const selectActions = [
    makeAction(
        'click',
        { target: 'vertex', mode: selectMode, vertexCursor: 'pointer', shapeCursor: 'pointer' },
        action(({ ctx, target }) => {
            if (target.type === 'vertex') {
                if (target.vertexId === ctx.selection.selectedVertexId) {
                    resetSelection(ctx);
                } else {
                    ctx.selection.selectedVertexId = target.vertexId;
                    ctx.selection.selectedShapeId = target.shapeId;
                }
            }
        })
    ),
    makeAction(
        'click',
        { target: 'shape', mode: selectMode, vertexCursor: 'pointer', shapeCursor: 'pointer' },
        action(({ ctx, target }) => {
            if (target.type === 'shape') {
                if (ctx.selection.selectedShapeId === target.shapeId) {
                    resetSelection(ctx);
                } else {
                    ctx.selection.selectedShapeId = target.shapeId;
                    ctx.selection.selectedVertexId = undefined;
                }
            }
        })
    ),
    makeAction(
        'click',
        { target: anyTarget, mode: selectMode, vertexCursor: 'pointer', shapeCursor: 'pointer' },
        ({ ctx }) => resetSelection(ctx)
    )
];

export const selectModes = {
    [selectMode]: {
        cancel: {
            cb: (ctx: AnnotationContext) => {
                resetSelection(ctx);
            }
        }
    }
};
