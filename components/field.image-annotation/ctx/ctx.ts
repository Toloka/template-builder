import { Core, UseTranslation } from '@toloka-tb/core/coreComponentApi';
import { useMemo } from 'react';

import { moveVertexActions } from '../features/moveVertex';
import { panActions } from '../features/panZoom';
import { selectActions, selectModes } from '../features/select';
import translations from '../i18n/field.image-annotation.translations';
import { ActionsContext, useActionContext } from './actions';
import { useHotkeysIntegration } from './hotkeysIntegration';
import { AnnotationAction } from './makeAction';
import { PositionContext, usePositionCtx } from './position';
import { LabelInfo, makeSelectionCtx, MenuItem, SelectionCtx } from './selection';
import { HydarateShape, makeValueCtx, SerializeShape, ValueCtx } from './value';

export type AnnotationContext = {
    position: PositionContext;
    actions: ActionsContext;
    value: ValueCtx;
    selection: SelectionCtx;

    disabled: boolean;
    t: ReturnType<UseTranslation<keyof typeof translations.ru>>;

    shapeSetupMap: ShapeSetupMap;
};

export type Mode = {
    cancel?: {
        getConfirmationText?: (ctx: AnnotationContext) => string;
        cb: (ctx: AnnotationContext) => { nextMode: string; nextModeInfo?: any } | void;
    };
    complete?: {
        cb: (ctx: AnnotationContext) => { nextMode: string; nextModeInfo?: any } | void;
    };
};

export type ModeMap = {
    [modeName: string]: Mode;
};

export type ShapeSetup = {
    shape: string;

    serialize: SerializeShape;
    hydrate: HydarateShape;

    component: React.FC<{ shapeId: string; ctx: AnnotationContext }>;

    control: React.FC<{ core: Core; ctx: AnnotationContext }>;
    actions: AnnotationAction[];
    modes: ModeMap;

    getVertexMenuItems: (ctx: AnnotationContext, shapeId: string, vertexId: string) => MenuItem[];
    getShapeMenuItems: (ctx: AnnotationContext, shapeId: string) => MenuItem[];
};

export type ShapeSetupMap = { [shape: string]: ShapeSetup };

export const useAnnotationContext = (
    core: Core,
    svgRef: React.RefObject<SVGSVGElement>,
    url: string,
    shapeSetupMap: ShapeSetupMap,
    labels: LabelInfo[],
    disabled: boolean,
    t: AnnotationContext['t']
) => {
    const { actionsSetup, modeSetup } = useMemo(() => {
        const newActions: AnnotationAction[] = [
            ...panActions,
            ...(disabled ? [] : moveVertexActions),
            ...selectActions
        ];
        const newModes: ModeMap = { ...selectModes };

        for (const setup of Object.values(shapeSetupMap)) {
            newActions.push(...setup.actions);
            for (const modeName in setup.modes) {
                newModes[modeName] = setup.modes[modeName];
            }
        }

        return { actionsSetup: newActions, modeSetup: newModes };
    }, [shapeSetupMap, disabled]);

    const position = usePositionCtx(core, svgRef, url, t);
    const actions = useActionContext(actionsSetup, modeSetup);

    const ctx = useMemo(() => {
        return {
            position: position.ctx,
            actions: actions.ctx,
            value: makeValueCtx(shapeSetupMap),
            selection: makeSelectionCtx(labels, shapeSetupMap),

            t,
            disabled,

            shapeSetupMap
        };
    }, [position.ctx, actions.ctx, shapeSetupMap, disabled, labels, t]);

    actions.useListeners(ctx);
    useHotkeysIntegration(core, ctx);

    return {
        ctx,
        resizeObserverRef: position.resizeObserverRef
    };
};
