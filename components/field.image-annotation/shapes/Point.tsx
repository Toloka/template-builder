import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext, ShapeSetup } from '../ctx/ctx';
import { actionCreators } from '../ctx/hotkeysIntegration';
import { anyTarget, makeAction } from '../ctx/makeAction';
import { getCursorPosInImgSpace } from '../ctx/position';
import { Shape, ShapeValue, ValueCtx } from '../ctx/value';
import { Control } from '../ui/Controls';

type PointValue = {
    shape: 'point';
    left: number;
    top: number;
} & ShapeValue;

type PointShape = {
    shape: 'point';
    label?: string;
    vertexId: string;
} & Shape;

const PointIcon = makeIcon(
    <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
);

const create = 'point';
const CreatePoint: ShapeSetup['control'] = observer(({ core, ctx }) => (
    <Control
        Icon={PointIcon}
        checked={ctx.actions.mode === create}
        onClick={() => ctx.actions.toggleMode(ctx, create)}
        tooltip={ctx.t('shapePointTooltip')}
        action={actionCreators.toggleMode}
        payload={create}
        core={core}
    />
));

const PointComponent: React.FC<{ shapeId: string; ctx: AnnotationContext }> = () => null;

const addPoint = (ctx: ValueCtx, left: number, top: number, label?: string) => {
    const shapeId = uniqueId('point-');
    const vertexId = uniqueId(`point-${shapeId}-`);
    const shape: PointShape = {
        shape: 'point',
        label,

        isEdited: false,
        isNew: false,

        vertexId
    };

    ctx.vertices[vertexId] = {
        left,
        top,
        onMove: (left, top) => {
            ctx.vertices[vertexId].left = left;
            ctx.vertices[vertexId].top = top;
        },
        shapeId
    };

    ctx.shapes[shapeId] = shape;

    return { shapeId, vertexId };
};

export const pointSetup: ShapeSetup = {
    shape: 'point',
    component: PointComponent,
    control: CreatePoint,
    hydrate: (value: PointValue, ctx) => addPoint(ctx, value.left, value.top, value.label),
    serialize: (shapeId: string, ctx) => {
        const shape = ctx.shapes[shapeId] as PointShape;
        const value: PointValue = {
            shape: 'point',
            left: ctx.vertices[shape.vertexId].left,
            top: ctx.vertices[shape.vertexId].top
        };

        if (shape.label !== undefined) {
            value.label = shape.label;
        }

        return value;
    },
    actions: [
        makeAction(
            'click',
            { mode: create, target: anyTarget, canvasCursor: 'crosshair' },
            ({ ctx, clientX, clientY }) => {
                const { left, top } = getCursorPosInImgSpace(ctx.position, clientX, clientY);

                addPoint(ctx.value, left, top, ctx.selection.activeLabel);
            }
        )
    ],
    modes: {
        [create]: {}
    },

    getShapeMenuItems: () => [],
    getVertexMenuItems: (ctx, shapeId, vertexId) => {
        return [
            {
                type: 'delete',
                label: ctx.t('shapePointMenuDelete'),
                checked: false,
                onToggle: action(() => {
                    delete ctx.value.shapes[shapeId];
                    delete ctx.value.vertices[vertexId];
                    ctx.selection.selectedShapeId = undefined;
                    ctx.selection.selectedVertexId = undefined;
                })
            }
        ];
    }
};
