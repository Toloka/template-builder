import { Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

import { AnnotationContext } from './ctx';

export type TextAnnotationHotkeyHandlers = {
    annotate: Array<(index: number) => void>;
    remove: Array<() => void>;
};

const base = 'action.field.text-annotation';

export const actionCreators = {
    annotate: (props: { payload: number }) => ({ type: `${base}.action.annotate`, payload: props.payload }),
    remove: () => ({ type: `${base}.action.removeAnnotation` })
};

export const useHotkeysIntegration = (core: Core, ctx: AnnotationContext) => {
    const handlers: TextAnnotationHotkeyHandlers = core.hooks.useSettings('field.text-annotation');

    React.useEffect(() => {
        if (!handlers) {
            return;
        }

        const annotateHandler = (index: number) => {
            if (ctx.disabled || ctx.labels.length <= index) return;

            const label = ctx.labels[index].value;

            if (!ctx.selection) {
                ctx.actions.toggleActiveLabel(ctx, label);
            }

            ctx.actions.annotate(ctx, label);
        };
        const removeHandler = () => {
            if (ctx.disabled) return;

            ctx.actions.removeAnnotation(ctx);
        };

        handlers.annotate.push(annotateHandler);
        handlers.remove.push(removeHandler);

        return () => {
            handlers.annotate = handlers.annotate.filter((handler) => handler !== annotateHandler);
            handlers.remove = handlers.remove.filter((handler) => handler !== removeHandler);
        };
    }, [ctx, handlers]);
};
