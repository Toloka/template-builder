import { Core } from '@toloka-tb/core/coreComponentApi';
import { useEffect } from 'react';

import { AnnotationContext } from './ctx';

export type ImageAnnotationHotkeyHandlers = {
    setLabel: (index: number) => void;
    toggleMode: (mode: 'select' | 'point' | 'rectangle' | 'polygon') => void;
    cancel: () => void;
    confirm: () => void;
};

const base = 'action.field.image-annotation';

export const actionCreators = {
    setActiveLabel: (props: { payload: number }) => ({ type: `${base}.set-label`, payload: props.payload }),
    toggleMode: (props: { payload: string }) => ({ type: `${base}.set-mode`, payload: props.payload }),
    cancel: () => ({ type: `${base}.cancel` }),
    confirm: () => ({ type: `${base}.confirm` })
};

export const useHotkeysIntegration = (core: Core, ctx: AnnotationContext) => {
    const handlers: ImageAnnotationHotkeyHandlers = core.hooks.useSettings('field.image-annotation');

    useEffect(() => {
        if (!handlers) {
            return;
        }

        const oldHandlers = { ...handlers };

        handlers.cancel = () => !ctx.disabled && ctx.actions.cancelMode(ctx);
        handlers.confirm = () => !ctx.disabled && ctx.actions.completeMode(ctx);

        handlers.setLabel = (index) => !ctx.disabled && ctx.selection.setActiveLabel(ctx, index);
        handlers.toggleMode = (mode) =>
            !ctx.disabled && (mode === 'select' || mode in ctx.shapeSetupMap) && ctx.actions.toggleMode(ctx, mode);

        return () => {
            Object.assign(handlers, oldHandlers);
        };
    }, [ctx, handlers]);
};
