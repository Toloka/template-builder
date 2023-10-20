import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import cx from 'classnames';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext, ShapeSetup } from '../ctx/ctx';
import { actionCreators } from '../ctx/hotkeysIntegration';
import { anyTarget, makeAction } from '../ctx/makeAction';
import { getCursorPosInImgSpace, left2x, top2y } from '../ctx/position';
import { Shape, ShapeValue, ValueCtx } from '../ctx/value';
import { Control } from '../ui/Controls';
import styles from './Shape.less';

type RectangleValue = {
    shape: 'rectangle';
    left: number;
    top: number;
    width: number;
    height: number;
} & ShapeValue;

type RectangleShape = {
    shape: 'rectangle';
    label?: string;
    vertex1: string;
    vertex2: string;

    utilVertex1: string;
    utilVertex2: string;
} & Shape;

const RectangleIcon = makeIcon(
    <>
        <path d="m93.75 0h-75c-10.355469 0-18.75 8.394531-18.75 18.75v75c0 10.355469 8.394531 18.75 18.75 18.75h75c10.355469 0 18.75-8.394531 18.75-18.75v-75c0-10.355469-8.394531-18.75-18.75-18.75zm0 0" />
        <path d="m150 37.5h340v37.5h-340zm0 0" />
        <path d="m621.25 0h-75c-10.355469 0-18.75 8.394531-18.75 18.75v75c0 10.355469 8.394531 18.75 18.75 18.75h75c10.355469 0 18.75-8.394531 18.75-18.75v-75c0-10.355469-8.394531-18.75-18.75-18.75zm0 0" />
        <path d="m37.5 150h37.5v340h-37.5zm0 0" />
        <path d="m93.75 527.5h-75c-10.355469 0-18.75 8.394531-18.75 18.75v75c0 10.355469 8.394531 18.75 18.75 18.75h75c10.355469 0 18.75-8.394531 18.75-18.75v-75c0-10.355469-8.394531-18.75-18.75-18.75zm0 0" />
        <path d="m565 150h37.5v340h-37.5zm0 0" />
        <path d="m150 565h340v37.5h-340zm0 0" />
        <path d="m621.25 527.5h-75c-10.355469 0-18.75 8.394531-18.75 18.75v75c0 10.355469 8.394531 18.75 18.75 18.75h75c10.355469 0 18.75-8.394531 18.75-18.75v-75c0-10.355469-8.394531-18.75-18.75-18.75zm0 0" />
    </>,
    'RectangleIcon',
    { viewBox: '-21 -22 682 682' }
);

export const create = 'rectangle';
export const finish = 'finishRectangle';
const CreateRectangle: ShapeSetup['control'] = observer(({ core, ctx }) => (
    <Control
        Icon={RectangleIcon}
        checked={ctx.actions.mode === create || ctx.actions.mode === finish}
        onClick={() => ctx.actions.toggleMode(ctx, create)}
        tooltip={ctx.t('shapeRectangleTooltip')}
        action={actionCreators.toggleMode}
        payload={create}
        core={core}
    />
));

const RectangleComponent: React.FC<{ shapeId: string; ctx: AnnotationContext }> = observer((props) => {
    const shape = props.ctx.value.shapes[props.shapeId] as RectangleShape;

    if (!shape) {
        return null;
    }

    const vertex1 = props.ctx.value.vertices[shape.vertex1];
    const vertex2 = props.ctx.value.vertices[shape.vertex2];

    const x = left2x(props.ctx.position, Math.min(vertex1.left, vertex2.left));
    const y = top2y(props.ctx.position, Math.min(vertex1.top, vertex2.top));

    const width = left2x(props.ctx.position, Math.max(vertex1.left, vertex2.left)) - x;
    const height = top2y(props.ctx.position, Math.max(vertex1.top, vertex2.top)) - y;

    const isSelected = props.ctx.selection.selectedShapeId === props.shapeId;
    const color = props.ctx.selection.getColor(props.ctx, props.shapeId);

    return (
        <rect
            x={x}
            y={y}
            width={Math.max(width, 1)}
            height={Math.max(height, 1)} // always be wisible with at least 1 SCREEN pixel of size
            stroke={color}
            fill={color}
            className={cx(
                styles.shape,
                shape.isEdited && styles.shapeEdited,
                shape.isNew && styles.shapeNew,
                props.ctx.actions.mode === 'select' && styles.shapeSelectable,
                isSelected && styles.shapeSelected
            )}
            cursor={props.ctx.actions.shapeCursor}
            data-annotation-shape-id={props.shapeId}
        />
    );
});

const addRectangle = (
    ctx: ValueCtx,
    {
        left,
        top,
        width,
        height,
        isNew,
        label
    }: {
        left: number;
        top: number;
        width: number;
        height: number;
        isNew: boolean;
        label?: string;
    }
) => {
    const shapeId = uniqueId('rectangle-');
    const vertexTL = uniqueId(`rectangle-${shapeId}-`);
    const vertexBR = uniqueId(`rectangle-${shapeId}-`);

    const vertexTR = uniqueId(`rectangle-${shapeId}-util-`);
    const vertexBL = uniqueId(`rectangle-${shapeId}-util-`);

    const shape: RectangleShape = {
        shape: 'rectangle',
        label,

        isEdited: false,
        isNew,

        vertex1: vertexTL,
        vertex2: vertexBR,

        utilVertex1: vertexTR,
        utilVertex2: vertexBL
    };

    ctx.vertices[vertexTL] = {
        left,
        top,
        onMove: (left, top) => {
            ctx.vertices[vertexTL].left = left;
            ctx.vertices[vertexBL].left = left;

            ctx.vertices[vertexTL].top = top;
            ctx.vertices[vertexTR].top = top;
        },
        shapeId
    };
    ctx.vertices[vertexTR] = {
        left: left + width,
        top,
        onMove: (left, top) => {
            ctx.vertices[vertexTR].left = left;
            ctx.vertices[vertexBR].left = left;

            ctx.vertices[vertexTL].top = top;
            ctx.vertices[vertexTR].top = top;
        },
        shapeId
    };
    ctx.vertices[vertexBL] = {
        left,
        top: top + height,
        onMove: (left, top) => {
            ctx.vertices[vertexTL].left = left;
            ctx.vertices[vertexBL].left = left;

            ctx.vertices[vertexBL].top = top;
            ctx.vertices[vertexBR].top = top;
        },
        shapeId
    };
    ctx.vertices[vertexBR] = {
        left: left + width,
        top: top + height,
        onMove: (left, top) => {
            ctx.vertices[vertexBR].left = left;
            ctx.vertices[vertexTR].left = left;

            ctx.vertices[vertexBL].top = top;
            ctx.vertices[vertexBR].top = top;
        },
        shapeId
    };

    ctx.shapes[shapeId] = shape;

    return shapeId;
};

const deleteRectangle = action((ctx: AnnotationContext, shapeId: string) => {
    const shape = ctx.value.shapes[shapeId] as RectangleShape;

    delete ctx.value.vertices[shape.vertex1];
    delete ctx.value.vertices[shape.vertex2];
    delete ctx.value.vertices[shape.utilVertex1];
    delete ctx.value.vertices[shape.utilVertex2];
    delete ctx.value.shapes[shapeId];
    ctx.selection.selectedShapeId = undefined;
    ctx.selection.selectedVertexId = undefined;
});

export const rectangleSetup: ShapeSetup = {
    shape: 'rectangle',
    component: RectangleComponent,
    control: CreateRectangle,
    hydrate: (value: RectangleValue, ctx) =>
        addRectangle(ctx, {
            ...value,
            isNew: false
        }),
    serialize: (shapeId: string, ctx) => {
        const shape = ctx.shapes[shapeId] as RectangleShape;
        const vertex1 = ctx.vertices[shape.vertex1];
        const vertex2 = ctx.vertices[shape.vertex2];

        const left = Math.min(vertex1.left, vertex2.left);
        const width = Math.max(vertex1.left, vertex2.left) - left;

        const top = Math.min(vertex1.top, vertex2.top);
        const height = Math.max(vertex1.top, vertex2.top) - top;

        const value: RectangleValue = {
            shape: 'rectangle',
            left,
            top,
            width,
            height
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

                const shapeId = addRectangle(ctx.value, {
                    left,
                    top,
                    width: 0,
                    height: 0,
                    isNew: true,
                    label: ctx.selection.activeLabel
                });
                const shape = ctx.value.shapes[shapeId] as RectangleShape;

                ctx.actions.forceDrag(
                    {
                        ctx,
                        clientX,
                        clientY,
                        target: { type: 'vertex', shapeId, vertexId: shape.vertex2 }
                    },
                    () => ctx.actions.completeMode(ctx)
                );

                ctx.actions.modeInfo = shapeId;
                ctx.actions.completeMode(ctx);
                ctx.selection.selectedShapeId = shapeId;
                ctx.selection.selectedVertexId = undefined;
            }
        ),
        makeAction('click', { mode: finish, target: anyTarget, canvasCursor: 'crosshair' }, ({ ctx }) => {
            ctx.actions.completeMode(ctx);
        })
    ],
    modes: {
        [create]: {
            complete: {
                cb: (ctx: AnnotationContext) => {
                    // go to finish only if first point placed
                    if (ctx.actions.modeInfo) {
                        return {
                            nextMode: finish,
                            nextModeInfo: ctx.actions.modeInfo
                        };
                    } else {
                        return { nextMode: create };
                    }
                }
            }
        },
        [finish]: {
            cancel: {
                cb: (ctx: AnnotationContext) => {
                    ctx.selection.selectedShapeId = undefined;
                    deleteRectangle(ctx, ctx.actions.modeInfo);

                    return { nextMode: create };
                }
            },
            complete: {
                cb: (ctx: AnnotationContext) => {
                    ctx.selection.selectedShapeId = undefined;
                    ctx.selection.selectedVertexId = undefined;
                    ctx.value.shapes[ctx.actions.modeInfo].isNew = false;
                    ctx.value.shapes[ctx.actions.modeInfo].isEdited = false;
                    ctx.actions.endInteraction();

                    return { nextMode: create };
                }
            }
        }
    },

    getShapeMenuItems: (ctx, shapeId) => {
        const isFinishing = ctx.actions.mode === finish && ctx.actions.modeInfo === shapeId;

        return isFinishing
            ? [
                  {
                      type: 'confirm' as const,
                      label: ctx.t('shapeRectangleMenuConfirm'),
                      checked: false,
                      onToggle: () => ctx.actions.completeMode(ctx)
                  },
                  {
                      type: 'cancel' as const,
                      label: ctx.t('shapeRectangleMenuCancel'),
                      checked: false,
                      onToggle: () => ctx.actions.cancelMode(ctx)
                  }
              ]
            : [
                  {
                      type: 'delete' as const,
                      label: ctx.t('shapeRectangleMenuDelete'),
                      checked: false,
                      onToggle: () => deleteRectangle(ctx, shapeId)
                  }
              ];
    },
    getVertexMenuItems: () => []
};
