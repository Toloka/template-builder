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
import { Shape, ShapeValue } from '../ctx/value';
import { Control } from '../ui/Controls';
import { Halo } from '../ui/Vertex';
import styles from './Shape.less';

type PolygonValue = {
    shape: 'polygon';
    points: Array<{ left: number; top: number }>;
} & ShapeValue;

type PolygonShape = {
    shape: 'polygon';
    label?: string;
    vertexIds: string[];
} & Shape;

const PolygonIcon = makeIcon(
    <>
        <path d="m442.738281 229.867188c31.015625 0 56.25-25.234376 56.25-56.25 0-31.019532-25.234375-56.25-56.25-56.25s-56.25 25.230468-56.25 56.25c0 31.015624 25.234375 56.25 56.25 56.25zm0 0" />
        <path d="m179.578125 112.5c31.015625 0 56.25-25.234375 56.25-56.25s-25.234375-56.25-56.25-56.25-56.25 25.234375-56.25 56.25 25.234375 56.25 56.25 56.25zm0 0" />
        <path d="m583.75 432.296875c-31.015625 0-56.25 25.226563-56.25 56.25 0 31.015625 25.234375 56.25 56.25 56.25s56.25-25.234375 56.25-56.25c0-31.023437-25.234375-56.25-56.25-56.25zm0 0" />
        <path d="m463.160156 265.097656 65.964844 147.324219c10.09375-7.261719 21.675781-12.570313 34.203125-15.359375l-65.960937-147.328125c-10.097657 7.265625-21.679688 12.570313-34.207032 15.363281zm0 0" />
        <path d="m366.539062 119.101562-95.445312-42.570312c-2.777344 12.535156-8.066406 24.128906-15.316406 34.230469l95.449218 42.566406c2.773438-12.527344 8.066407-24.117187 15.3125-34.226563zm0 0" />
        <path d="m490.054688 486.402344-346.765626 62.585937c4.3125 10.757813 6.710938 22.480469 6.710938 34.761719 0 .71875-.039062 1.425781-.054688 2.144531l346.765626-62.589843c-4.3125-10.757813-6.710938-22.484376-6.710938-34.757813 0-.71875.039062-1.433594.054688-2.144531zm0 0" />
        <path d="m176.933594 149.929688c-13.003906-.359376-25.347656-3.375-36.519532-8.53125l-81.515624 348.671874c13 .359376 25.34375 3.375 36.511718 8.53125zm0 0" />
        <path d="m56.25 527.5c-31.015625 0-56.25 25.234375-56.25 56.25s25.234375 56.25 56.25 56.25 56.25-25.234375 56.25-56.25-25.234375-56.25-56.25-56.25zm0 0" />
    </>,
    'PolygonIcon',
    { viewBox: '-21 -22 682 682' }
);

const create = 'polygon';
const finish = 'finishPolygon';
const CreatePolygon: ShapeSetup['control'] = observer(({ core, ctx }) => (
    <Control
        Icon={PolygonIcon}
        checked={ctx.actions.mode === create || ctx.actions.mode === finish}
        onClick={() => ctx.actions.toggleMode(ctx, create)}
        tooltip={ctx.t('shapePolygonTooltip')}
        action={actionCreators.toggleMode}
        payload={create}
        core={core}
    />
));

const PolygonComponent: React.FC<{ shapeId: string; ctx: AnnotationContext }> = observer((props) => {
    const shape = props.ctx.value.shapes[props.shapeId] as PolygonShape;

    if (!shape) {
        return null;
    }

    const points = shape.vertexIds
        .map((vertexId) => {
            const vertex = props.ctx.value.vertices[vertexId];

            return `${left2x(props.ctx.position, vertex.left)},${top2y(props.ctx.position, vertex.top)}`;
        })
        .join(' ');

    const isSelected = props.ctx.selection.selectedShapeId === props.shapeId;
    const color = props.ctx.selection.getColor(props.ctx, props.shapeId);

    const initialVertex = props.ctx.value.vertices[shape.vertexIds[0]];

    if (shape.isNew) {
        return (
            <>
                <polyline
                    points={points}
                    fill={color}
                    stroke={color}
                    className={cx(
                        styles.shape,
                        shape.isEdited && styles.shapeEdited,
                        shape.isNew && styles.shapeNew,
                        isSelected && styles.shapeSelected
                    )}
                    data-annotation-shape-id={props.shapeId}
                />
                <Halo
                    x={left2x(props.ctx.position, initialVertex.left)}
                    y={top2y(props.ctx.position, initialVertex.top)}
                    vertexId={shape.vertexIds[0]}
                    color={'#f2f2f2'}
                    shapeId={props.shapeId}
                    cursor={'pointer'}
                />
            </>
        );
    }

    return (
        <polygon
            points={points}
            fill={color}
            stroke={color}
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

const deletePolygon = action((ctx: AnnotationContext, shapeId: string, forceActiveDeletion: boolean) => {
    const shape = ctx.value.shapes[shapeId] as PolygonShape;

    if (ctx.actions.mode === finish && ctx.actions.modeInfo === shapeId && !forceActiveDeletion) {
        return ctx.actions.cancelMode(ctx);
    }

    for (const vertexId of shape.vertexIds) {
        delete ctx.value.vertices[vertexId];
    }
    delete ctx.value.shapes[shapeId];
    ctx.selection.selectedShapeId = undefined;
    ctx.selection.selectedVertexId = undefined;
});

export const polygonSetup: ShapeSetup = {
    shape: 'polygon',
    component: PolygonComponent,
    control: CreatePolygon,
    hydrate: (value: PolygonValue, ctx) => {
        const shapeId = uniqueId('polygon-');

        const shape: PolygonShape = {
            shape: 'polygon',
            label: value.label,

            isEdited: false,
            isNew: false,

            vertexIds: []
        };

        for (const point of value.points) {
            const vertexId = uniqueId(`polygon-${shapeId}-`);

            ctx.vertices[vertexId] = {
                ...point,
                onMove: (left, top) => {
                    ctx.vertices[vertexId].left = left;
                    ctx.vertices[vertexId].top = top;
                },
                shapeId
            };

            shape.vertexIds.push(vertexId);
        }

        ctx.shapes[shapeId] = shape;
    },
    serialize: (shapeId: string, ctx): PolygonValue => {
        const shape = ctx.shapes[shapeId] as PolygonShape;

        const value: PolygonValue = {
            shape: 'polygon',
            points: shape.vertexIds.map((vertexId) => ({
                left: ctx.vertices[vertexId].left,
                top: ctx.vertices[vertexId].top
            }))
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
                const shapeId = uniqueId('polygon-');
                const initialVertexId = uniqueId(`polygon-${shapeId}-`);

                const shape: PolygonShape = {
                    shape: 'polygon',
                    label: ctx.selection.activeLabel,

                    isEdited: false,
                    isNew: true,

                    vertexIds: [initialVertexId]
                };

                ctx.value.vertices[initialVertexId] = {
                    left,
                    top,
                    onMove: (left, top) => {
                        ctx.value.vertices[initialVertexId].left = left;
                        ctx.value.vertices[initialVertexId].top = top;
                    },
                    shapeId
                };

                ctx.value.shapes[shapeId] = shape;
                ctx.actions.modeInfo = shapeId;
                ctx.actions.completeMode(ctx);
                ctx.selection.selectedShapeId = shapeId;
                ctx.selection.selectedVertexId = undefined;
            }
        ),
        makeAction(
            'click',
            { mode: finish, target: anyTarget, canvasCursor: 'crosshair' },
            ({ ctx, clientX, clientY }) => {
                const { left, top } = getCursorPosInImgSpace(ctx.position, clientX, clientY);
                const shapeId = ctx.actions.modeInfo;
                const shape = ctx.value.shapes[shapeId] as PolygonShape;
                const newVertexId = uniqueId(`polygon-${shapeId}-`);

                ctx.value.vertices[newVertexId] = {
                    left,
                    top,
                    onMove: (left, top) => {
                        ctx.value.vertices[newVertexId].left = left;
                        ctx.value.vertices[newVertexId].top = top;
                    },
                    shapeId
                };

                shape.vertexIds.push(newVertexId);
            }
        ),
        makeAction('click', { mode: finish, target: 'vertex', vertexCursor: 'pointer' }, ({ ctx, target }) => {
            if (target.type !== 'vertex') {
                return;
            }

            const shapeId = ctx.actions.modeInfo;
            const shape = ctx.value.shapes[shapeId] as PolygonShape;

            if (target.shapeId === shapeId && shape.vertexIds[0] === target.vertexId) {
                ctx.actions.completeMode(ctx);
            } else {
                ctx.selection.selectedVertexId = target.vertexId;
                ctx.selection.selectedShapeId = target.shapeId;
            }
        })
    ],
    modes: {
        [create]: {
            complete: {
                cb: (ctx: AnnotationContext) => {
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
                getConfirmationText: (ctx) => ctx.t('shapePolygonCancelConfirm'),
                cb: (ctx: AnnotationContext) => {
                    ctx.selection.selectedShapeId = undefined;
                    deletePolygon(ctx, ctx.actions.modeInfo, true);

                    return { nextMode: create };
                }
            },
            complete: {
                cb: (ctx: AnnotationContext) => {
                    const shape = ctx.value.shapes[ctx.actions.modeInfo] as PolygonShape;

                    if (shape.vertexIds.length < 3) {
                        // eslint-disable-next-line no-alert
                        alert(ctx.t('shapePolygonMinVertex'));

                        return { nextMode: ctx.actions.mode, nextModeInfo: ctx.actions.modeInfo };
                    }

                    ctx.selection.selectedShapeId = undefined;
                    ctx.selection.selectedVertexId = undefined;
                    ctx.value.shapes[ctx.actions.modeInfo].isNew = false;
                    ctx.value.shapes[ctx.actions.modeInfo].isEdited = false;

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
                      label: ctx.t('shapePolygonMenuConfirm'),
                      checked: false,
                      onToggle: () => ctx.actions.completeMode(ctx)
                  },
                  {
                      type: 'cancel' as const,
                      label: ctx.t('shapePolygonMenuCancel'),
                      checked: false,
                      onToggle: () => ctx.actions.cancelMode(ctx)
                  }
              ]
            : [
                  {
                      type: 'delete' as const,
                      label: ctx.t('shapePolygonMenuDelete'),
                      checked: false,
                      onToggle: () => deletePolygon(ctx, shapeId, false)
                  }
              ];
    },
    getVertexMenuItems: (ctx, shapeId, vertexId) => {
        const shape = ctx.value.shapes[shapeId] as PolygonShape;

        if (shape.vertexIds.length <= 3) {
            return [];
        }

        return [
            {
                type: 'delete',
                label: ctx.t('shapePolygonMenuDeleteVertex'),
                checked: false,
                onToggle: action(() => {
                    shape.vertexIds.splice(shape.vertexIds.indexOf(vertexId), 1);
                    delete ctx.value.vertices[vertexId];
                    ctx.selection.selectedShapeId = undefined;
                    ctx.selection.selectedVertexId = undefined;
                })
            }
        ];
    }
};
