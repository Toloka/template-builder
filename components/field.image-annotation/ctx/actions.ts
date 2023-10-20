import { action, observable } from 'mobx';
import { useEffect, useMemo } from 'react';

import { makeZoomHandler } from '../features/panZoom';
import { AnnotationContext, ModeMap } from './ctx';
import { AnnotationAction, anyMode, anyTarget, EventHandler, EventInfo, Target } from './makeAction';

type Interaction =
    | { type: 'mousedown'; clientX: number; clientY: number; target: Target }
    | { type: 'drag'; handler: ReturnType<EventHandler<'drag'>>; target: Target }
    | { type: 'none' };

const defaultMode = 'select';
const noInteraction: Interaction = { type: 'none' };

export type ActionsContext = {
    handleCanvasClick: EventHandler<'click'> | undefined;
    handleShapeClick: EventHandler<'click'> | undefined;
    handleVertexClick: EventHandler<'click'> | undefined;

    initCanvasDrag: EventHandler<'drag'> | undefined;
    initVertexDrag: EventHandler<'drag'> | undefined;

    forceDrag: (info: EventInfo, onEnd: () => void) => void;
    endInteraction: () => void;

    mode: string;
    modeInfo: any;

    toggleMode: (fullCtx: AnnotationContext, newMode: string) => void;
    completeMode: (fullCtx: AnnotationContext) => void;
    cancelMode: (fullCtx: AnnotationContext) => void;

    interaction: Interaction;

    canvasCursor: string;
    vertexCursor: string;
    shapeCursor: string;
};

export const throttle = <Args extends any[]>(f: (...args: Args) => void, ms: number): ((...args: Args) => void) => {
    let lastArgs: Args | undefined;
    let timeout: ReturnType<typeof window.setTimeout> | undefined;

    const throttled = (...args: Args) => {
        if (timeout) {
            lastArgs = args;

            return;
        }

        f(...args);

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = undefined;
            if (lastArgs) {
                throttled(...lastArgs);
                lastArgs = undefined;
            }
        }, ms);
    };

    return throttled;
};

const getEventTarget = (event: MouseEvent): Target => {
    if (event.target instanceof Element) {
        const vertexId = event.target.getAttribute('data-annotation-vertex-id');
        const shapeId = event.target.getAttribute('data-annotation-shape-id');

        if (vertexId && shapeId) {
            return { vertexId, shapeId, type: 'vertex' };
        }

        if (shapeId) {
            return { shapeId, type: 'shape' };
        }
    }

    return noInteraction;
};

const noClick = () => {
    /* noop */
};
const noDrag: EventHandler<'drag'> = () => ({});

const getDragHandler = (ctx: AnnotationContext, target: Target) => {
    if (target.type === 'vertex' && ctx.actions.initVertexDrag) {
        return ctx.actions.initVertexDrag();
    }

    if (ctx.actions.initCanvasDrag) {
        return ctx.actions.initCanvasDrag();
    }

    return noDrag();
};

const getClickHandler = (ctx: AnnotationContext, target: Target) => {
    if (target.type === 'vertex' && ctx.actions.handleVertexClick) {
        return ctx.actions.handleVertexClick;
    }

    if (target.type === 'shape' && ctx.actions.handleShapeClick) {
        return ctx.actions.handleShapeClick;
    }

    if (ctx.actions.handleCanvasClick) {
        return ctx.actions.handleCanvasClick;
    }

    return noClick;
};

const startDrag = (ctx: AnnotationContext, onEnd?: () => void) => {
    if (ctx.actions.interaction.type === 'mousedown') {
        const { clientX, clientY, target } = ctx.actions.interaction;

        const drag = getDragHandler(ctx, target);

        if (onEnd) {
            const dragEndHandler = drag.end;

            if (dragEndHandler) {
                drag.end = (info) => {
                    dragEndHandler(info);
                    onEnd();
                };
            } else {
                drag.end = onEnd;
            }
        }

        ctx.actions.interaction = {
            type: 'drag',
            handler: drag,
            target
        };

        if (drag.start) {
            drag.start({ ctx, clientX, clientY, target });
        }
    }
};

const useListeners = (ctx: AnnotationContext) => {
    useEffect(() => {
        const svg = ctx.position.canvas.getSVG();

        const handleZoom = makeZoomHandler(ctx);

        svg.addEventListener('wheel', handleZoom, { passive: false });

        return () => {
            svg.removeEventListener('wheel', handleZoom);
        };
    }, [ctx]);

    useEffect(() => {
        const svg = ctx.position.canvas.getSVG();

        const onDrag = (clientX: number, clientY: number) => {
            if (ctx.actions.interaction.type === 'drag' && ctx.actions.interaction.handler.move) {
                ctx.actions.interaction.handler.move({ ctx, clientX, clientY, target: ctx.actions.interaction.target });
            }
        };
        const onDragThrottled = throttle(onDrag, 32);

        let dragTimeout: number;

        const onMouseDown = (event: MouseEvent) => {
            if (event.button === 0 && ctx.actions.interaction.type === 'none') {
                const target = getEventTarget(event);

                ctx.actions.interaction = {
                    type: 'mousedown',
                    clientX: event.clientX,
                    clientY: event.clientY,
                    target
                };

                dragTimeout = window.setTimeout(() => startDrag(ctx), 200);
            }
        };

        const onMouseMove = (event: MouseEvent) => {
            if (ctx.actions.interaction.type === 'drag') {
                onDragThrottled(event.clientX, event.clientY);
            }

            if (ctx.actions.interaction.type === 'mousedown') {
                const initialX = ctx.actions.interaction.clientX;
                const initialY = ctx.actions.interaction.clientY;

                if (
                    Math.abs((event.clientX - initialX) ** 2 + (event.clientY - initialY) ** 2) > 100 // moved more then by 10px
                ) {
                    startDrag(ctx);
                    onDragThrottled(event.clientX, event.clientY);

                    clearTimeout(dragTimeout);
                }
            }
        };

        const onMouseLeave = (event: MouseEvent) => {
            if (ctx.actions.interaction.type === 'drag') {
                onDragThrottled(event.clientX, event.clientY);
            }
        };

        const onMouseUp = (event: MouseEvent) => {
            clearTimeout(dragTimeout);

            if (ctx.actions.interaction.type === 'drag') {
                const drag = ctx.actions.interaction.handler;
                const target = ctx.actions.interaction.target;

                ctx.actions.interaction = noInteraction;

                if (drag) {
                    if (drag.end) {
                        drag.end({
                            ctx,
                            clientX: event.clientX,
                            clientY: event.clientY,
                            target
                        });
                    }
                }
            }

            if (ctx.actions.interaction.type === 'mousedown') {
                const target = ctx.actions.interaction.target;

                ctx.actions.interaction = noInteraction;

                getClickHandler(
                    ctx,
                    target
                )({
                    ctx,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    target
                });
            }
        };

        svg.addEventListener('mousedown', onMouseDown);
        svg.addEventListener('mousemove', onMouseMove);
        svg.addEventListener('mouseup', onMouseUp);
        svg.addEventListener('mouseleave', onMouseLeave);

        return () => {
            svg.removeEventListener('mousedown', onMouseDown);
            svg.removeEventListener('mousemove', onMouseMove);
            svg.removeEventListener('mouseup', onMouseUp);
            svg.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [ctx]);
};

const getActionPriority = (action: AnnotationAction) => {
    let priority = 0;

    if (action.mode !== anyMode) {
        priority += 1;
    }
    if (action.target !== anyTarget) {
        priority += 5;
    }

    return priority;
};
const getActionWithTopPrioriy = (actions: AnnotationAction[], currentMode: string) => {
    let priority = -1;
    let chosen: AnnotationAction | undefined;

    for (const action of actions) {
        const actionPriority = getActionPriority(action);

        if (actionPriority > priority && (action.mode === anyMode || action.mode === currentMode)) {
            priority = actionPriority;
            chosen = action;
        }
    }

    return chosen;
};

const cancelCurrentMode = (ctx: AnnotationContext, modeSetup: ModeMap) => {
    const cancel = modeSetup[ctx.actions.mode].cancel?.cb;

    if (!cancel) {
        return true;
    }

    const getConfirmationText = modeSetup[ctx.actions.mode].cancel?.getConfirmationText;

    if (getConfirmationText) {
        const confirmationText = getConfirmationText(ctx);
        // eslint-disable-next-line no-alert
        const doCancel = confirmationText ? confirm(confirmationText) : true;

        if (!doCancel) {
            return false;
        }
    }

    const { nextMode, nextModeInfo } = cancel(ctx) || {};

    ctx.actions.interaction = noInteraction;
    ctx.actions.mode = nextMode || defaultMode;
    ctx.actions.modeInfo = nextModeInfo || undefined;

    return true;
};

const completeCurrentMode = (ctx: AnnotationContext, modeSetup: ModeMap) => {
    const complete = modeSetup[ctx.actions.mode].complete?.cb;

    if (!complete) {
        return;
    }

    const { nextMode, nextModeInfo } = complete(ctx) || {};

    ctx.actions.mode = nextMode || defaultMode;
    ctx.actions.modeInfo = nextModeInfo || undefined;
};

export const useActionContext = (actions: AnnotationAction[], modeSetup: ModeMap) => {
    const ctx: ActionsContext = useMemo(() => {
        const canvasClickActions = actions.filter((action) => action.event === 'click' && action.target === anyTarget);
        const shapeClickActions = actions.filter((action) => action.event === 'click' && action.target === 'shape');
        const vertexClickActions = actions.filter((action) => action.event === 'click' && action.target === 'vertex');

        const canvasDragActions = actions.filter((action) => action.event === 'drag' && action.target === anyTarget);
        const vertexDragActions = actions.filter((action) => action.event === 'drag' && action.target === 'vertex');

        const canvasActionsWithCursor = actions.filter((action) => action.target === anyTarget && action.canvasCursor);
        const vertexActionsWithCursor = actions.filter((action) => action.target === 'vertex' && action.vertexCursor);
        const shapeActionsWithCursor = actions.filter((action) => action.target === 'vertex' && action.shapeCursor);

        return observable({
            mode: defaultMode,
            modeInfo: undefined,

            toggleMode: action((fullCtx: AnnotationContext, newMode: string) => {
                const didCancel = cancelCurrentMode(fullCtx, modeSetup);

                if (!didCancel) {
                    return;
                }

                if (fullCtx.actions.mode === newMode) {
                    fullCtx.actions.mode = defaultMode;
                } else {
                    fullCtx.actions.mode = newMode;
                }
            }),
            completeMode: action((fullCtx: AnnotationContext) => completeCurrentMode(fullCtx, modeSetup)),
            cancelMode: action((fullCtx: AnnotationContext) => cancelCurrentMode(fullCtx, modeSetup)),

            get handleCanvasClick() {
                return getActionWithTopPrioriy(canvasClickActions, ctx.mode)?.handler;
            },
            get handleShapeClick() {
                return getActionWithTopPrioriy(shapeClickActions, ctx.mode)?.handler;
            },
            get handleVertexClick() {
                return getActionWithTopPrioriy(vertexClickActions, ctx.mode)?.handler;
            },

            get initCanvasDrag() {
                return getActionWithTopPrioriy(canvasDragActions, ctx.mode)?.handler as EventHandler<'drag'>;
            },
            get initVertexDrag() {
                return getActionWithTopPrioriy(vertexDragActions, ctx.mode)?.handler as EventHandler<'drag'>;
            },

            interaction: noInteraction,
            forceDrag: action((info: EventInfo, onEnd: () => void) => {
                info.ctx.actions.interaction = {
                    type: 'mousedown',
                    clientX: info.clientX,
                    clientY: info.clientY,
                    target: info.target
                };
                startDrag(info.ctx, onEnd);
            }),
            endInteraction: () => {
                ctx.interaction = noInteraction;
            },

            get canvasCursor(): string {
                if (ctx.interaction.type === 'drag' && ctx.interaction.handler.cursor) {
                    return ctx.interaction.handler.cursor;
                }

                return getActionWithTopPrioriy(canvasActionsWithCursor, ctx.mode)?.canvasCursor || 'default';
            },
            get shapeCursor(): string {
                if (ctx.interaction.type === 'drag' && ctx.interaction.handler.cursor) {
                    return ctx.interaction.handler.cursor;
                }

                return getActionWithTopPrioriy(shapeActionsWithCursor, ctx.mode)?.shapeCursor || 'default';
            },
            get vertexCursor(): string {
                if (ctx.interaction.type === 'drag' && ctx.interaction.handler.cursor) {
                    return ctx.interaction.handler.cursor;
                }

                return getActionWithTopPrioriy(vertexActionsWithCursor, ctx.mode)?.vertexCursor || 'default';
            }
        });
    }, [actions, modeSetup]);

    return {
        ctx,
        useListeners
    };
};
