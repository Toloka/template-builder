import { action } from 'mobx';

import { AnnotationContext } from './ctx';

// annotation action utils
export const anyMode = Symbol('trigger in any mode');
export const anyTarget = Symbol('trigger on any target');

export type Target =
    | { type: 'vertex'; shapeId: string; vertexId: string }
    | { type: 'shape'; shapeId: string }
    | { type: 'none' };

export type EventInfo = {
    clientX: number;
    clientY: number;
    ctx: AnnotationContext;
    target: Target;
};

export type EventHandler<E extends 'click' | 'drag'> = E extends 'click'
    ? (info: EventInfo) => void
    : () => {
          start?: (info: EventInfo) => void;
          end?: (info: EventInfo) => void;
          move?: (info: EventInfo) => void;
          cursor?: string;
      };

type AnnotationActionOptions = {
    mode: string | typeof anyMode;
    target: 'vertex' | 'shape' | typeof anyTarget;
    canvasCursor?: string;
    vertexCursor?: string;
    shapeCursor?: string;
};

export type AnnotationAction = AnnotationActionOptions &
    ({ event: 'click'; handler: EventHandler<'click'> } | { event: 'drag'; handler: EventHandler<'drag'> });

export const makeAction = <E extends 'click' | 'drag'>(
    event: E,
    options: AnnotationActionOptions,
    handler: EventHandler<E>
) => {
    return {
        event,
        handler: action(handler),
        ...options
    } as AnnotationAction;
};
