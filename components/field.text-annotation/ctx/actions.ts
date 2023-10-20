import { action } from '@toloka-tb/core/node_modules/mobx';

import { addOrRemoveEntity } from '../utils/addOrRemoveEntity';
import { serialize } from '../utils/serialize';
import { spacesAdjust } from '../utils/spacesAdjust';
import { wordAdjust } from '../utils/wordAdjust';
import { AnnotationContext, Entity } from './ctx';

export type ActionsCtx = {
    annotate: (ctx: AnnotationContext, label: string) => void;
    removeAnnotation: (ctx: AnnotationContext) => void;
    toggleActiveLabel: (ctx: AnnotationContext, label: string) => void;
};

const clearBrowserSelection = () => {
    const selection = window.getSelection();

    if (selection) {
        selection.empty();
    }
};

export const makeActionsCtx = () => {
    const actionsCtx: ActionsCtx = {
        annotate: action((ctx, label) => {
            if (!ctx.selection) {
                return;
            }

            const adjustIfNeeded = (entity: Entity) =>
                ctx.adjust === 'words' ? wordAdjust(ctx.content, entity) : entity;

            const newEntity = adjustIfNeeded({
                label,
                offset: ctx.selection.offset,
                length: ctx.selection.length
            });

            if (addOrRemoveEntity(newEntity, ctx.value) === 'remove') {
                actionsCtx.removeAnnotation(ctx);
            } else {
                ctx.value = serialize([...ctx.value, newEntity]);
            }

            ctx.selection = null;
            clearBrowserSelection();
        }),
        removeAnnotation: action((ctx) => {
            if (!ctx.selection) return;

            const adjustIfNeeded = (entity: Entity) =>
                ctx.adjust === 'words' ? spacesAdjust(ctx.content, wordAdjust(ctx.content, entity)) : entity;

            const tmpEntityName = `__tmp-entity-${Math.random()}`;
            const tmpEntity = adjustIfNeeded({
                label: tmpEntityName,
                offset: ctx.selection.offset,
                length: ctx.selection.length
            });

            ctx.value = serialize([...ctx.value, tmpEntity]).filter((entity) => entity.label !== tmpEntityName);

            clearBrowserSelection();
        }),
        toggleActiveLabel: action((ctx, label) => {
            if (ctx.activeLabel === label) {
                ctx.activeLabel = null;
            } else {
                ctx.activeLabel = label;
            }
        })
    };

    return actionsCtx;
};
