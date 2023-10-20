import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { anyMode, anyTarget, makeAction } from '../ctx/makeAction';
import { getCursorPosInImgSpace, resetImagePosition, x2left, y2top, zoomAt } from '../ctx/position';
import { Control } from '../ui/Controls';

const zoomAtViewportCenter = (ctx: AnnotationContext, by: number) => {
    let currentCenterLeft = x2left(ctx.position, ctx.position.canvas.width / 2);
    let currentCenterTop = y2top(ctx.position, ctx.position.canvas.height / 2);

    if (currentCenterLeft < 0 || currentCenterLeft > 1) {
        currentCenterLeft = 0.5;
    }

    if (currentCenterTop < 0 || currentCenterTop > 1) {
        currentCenterTop = 0.5;
    }

    zoomAt(ctx.position, currentCenterLeft, currentCenterTop, by);
};

const ZoomInIcon = makeIcon(
    <path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.78 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.26 4.25c.41.41 1.07.41 1.48 0l.01-.01c.41-.41.41-1.07 0-1.48L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm0-7c-.28 0-.5.22-.5.5V9H7.5c-.28 0-.5.22-.5.5s.22.5.5.5H9v1.5c0 .28.22.5.5.5s.5-.22.5-.5V10h1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H10V7.5c0-.28-.22-.5-.5-.5z" />
);

export const ZoomIn: React.FC<{ ctx: AnnotationContext }> = (props) => (
    <Control
        Icon={ZoomInIcon}
        checked={false}
        onClick={() => zoomAtViewportCenter(props.ctx, 0.4)}
        tooltip={props.ctx.t('featureZoomIn')}
    />
);

const ZoomOutIcon = makeIcon(
    <path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.26 4.25c.41.41 1.07.41 1.48 0l.01-.01c.41-.41.41-1.07 0-1.48L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm-2-5h4c.28 0 .5.22.5.5s-.22.5-.5.5h-4c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z" />
);

export const ZoomOut: React.FC<{ ctx: AnnotationContext }> = (props) => (
    <Control
        Icon={ZoomOutIcon}
        checked={false}
        onClick={() => zoomAtViewportCenter(props.ctx, -0.4)}
        tooltip={props.ctx.t('featureZoomOut')}
    />
);

const ResetIcon = makeIcon(
    <path d="M4 15c-.55 0-1 .45-1 1v3c0 1.1.9 2 2 2h3c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1-.45-1-1v-2c0-.55-.45-1-1-1zm1-9c0-.55.45-1 1-1h2c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.1 0-2 .9-2 2v3c0 .55.45 1 1 1s1-.45 1-1V6zm14-3h-3c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1 .45 1 1v2c0 .55.45 1 1 1s1-.45 1-1V5c0-1.1-.9-2-2-2zm0 15c0 .55-.45 1-1 1h-2c-.55 0-1 .45-1 1s.45 1 1 1h3c1.1 0 2-.9 2-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v2zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
);

export const Reset: React.FC<{ ctx: AnnotationContext }> = (props) => (
    <Control
        Icon={ResetIcon}
        checked={false}
        onClick={() => resetImagePosition(props.ctx.position)}
        tooltip={props.ctx.t('featureZoomReset')}
    />
);

export const makeZoomHandler = (ctx: AnnotationContext) => {
    return (event: WheelEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const by = event.deltaMode === 1 ? -event.deltaY / 15 : -event.deltaY / 500;

        const { left, top } = getCursorPosInImgSpace(ctx.position, event.clientX, event.clientY);

        zoomAt(ctx.position, left, top, by);
    };
};

type PanInfo = {
    start: {
        x: number;
        y: number;
    };
    initialPan: {
        left: number;
        top: number;
    };
    panSpeed: number;
};

export const panActions = [
    makeAction('drag', { target: anyTarget, mode: anyMode }, () => {
        let panInfo: PanInfo | undefined;

        return {
            start: ({ ctx, clientX, clientY }) => {
                const zoomRatio = 1 / ctx.position.zoom;

                // wheel is pressed
                panInfo = {
                    start: {
                        x: clientX,
                        y: clientY
                    },
                    initialPan: {
                        left: ctx.position.pan.left,
                        top: ctx.position.pan.top
                    },
                    panSpeed: zoomRatio
                };
            },
            move: ({ ctx, clientX, clientY }) => {
                if (!panInfo) {
                    return;
                }

                const { start, panSpeed, initialPan } = panInfo;

                ctx.position.pan = {
                    left: (clientX - start.x) * panSpeed + initialPan.left,
                    top: (clientY - start.y) * panSpeed + initialPan.top
                };
            },
            cursor: 'grabbing'
        };
    })
];
