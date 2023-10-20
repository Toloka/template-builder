import { Core, UseTranslation } from '@toloka-tb/core/coreComponentApi';
import { observable, toJS } from 'mobx';
import * as React from 'react';
import isEqual from 'react-fast-compare';

import translations from '../i18n/field.text-annotation.translations';
import { Color, makeLabelColor } from '../utils/colors';
import { useCache } from '../utils/useCache';
import { ActionsCtx, makeActionsCtx } from './actions';
import { useHotkeysIntegration } from './useHotkeysIntegration';

export type Entity = {
    label: string;
    offset: number;
    length: number;
};

export type LabelInfo = {
    label: string;
    value: string;
};

export type SelectionCtx = {
    offset: number;
    length: number;
    trigger?: 'selection' | 'click';
} | null;

export type AnnotationContext = {
    content: string;
    value: Entity[];
    activeLabel: string | null;
    selection: SelectionCtx;
    labels: Array<LabelInfo & { color: Color }>;
    actions: ActionsCtx;
    t: ReturnType<UseTranslation<keyof typeof translations.ru>>;
    adjust: 'words' | undefined;
    disabled: boolean;
};

export const useAnnotationContext = (
    core: Core,
    content: string,
    initValue: Entity[],
    providedLabels: LabelInfo[],
    disabled: boolean,
    adjust: 'words' | undefined,
    t: AnnotationContext['t']
) => {
    // useEffect in field.text-annotation.tsx updates ctx.value without recreating full ctx
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const value = React.useMemo(() => initValue, []);
    const labels = useCache(() => toJS(providedLabels, { recurseEverything: true }), isEqual);

    const ctx: AnnotationContext = React.useMemo(() => {
        return observable({
            content,
            value,
            activeLabel: null,
            selection: null,
            labels: labels.map((label, index) => ({ ...label, color: makeLabelColor(index) })),
            actions: makeActionsCtx(),
            disabled,
            adjust,
            t
        });
    }, [content, value, labels, disabled, adjust, t]);

    useHotkeysIntegration(core, ctx);

    return ctx;
};
