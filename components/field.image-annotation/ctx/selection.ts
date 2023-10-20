import { observable } from 'mobx';

import { AnnotationContext, ShapeSetupMap } from './ctx';

export type LabelInfo = {
    label: string;
    value: string;
};

export type MenuItem = {
    label: string;
    checked: boolean;
    type: 'label' | 'delete' | 'confirm' | 'cancel' | 'none';
    color?: string;
    onToggle: () => void;
};

export type SelectionCtx = {
    selectedVertexId: string | undefined;
    selectedShapeId: string | undefined;

    activeLabel: string | undefined;
    setActiveLabel: (ctx: AnnotationContext, index: number) => void;

    getColor: (ctx: AnnotationContext, shapeId?: string) => string;
    getMenu: (ctx: AnnotationContext) => MenuItem[] | undefined;
};

// label color generation
const presetLabelColors = ['#ed5b38', '#74ee15', '#001eff', '#ffe700', '#4deeea'];
const getRandomColor = () => '#000000'.replace(/0/g, () => Math.floor(Math.random() * 16).toString(16));

export const makeLabelColors = (labels: LabelInfo[] = []) => {
    const colors: { [value: string]: string } = {};

    labels.forEach(({ value }, idx) => {
        colors[value] = presetLabelColors[idx] || getRandomColor();
    });

    return colors;
};

export const makeSelectionCtx = (labels: LabelInfo[], shapeSetupMap: ShapeSetupMap): SelectionCtx => {
    const getShapeMenuItems = (fullContext: AnnotationContext, shapeId: string) => {
        const shape = fullContext.value.shapes[shapeId].shape;

        return shapeSetupMap[shape].getShapeMenuItems(fullContext, shapeId);
    };

    const getVertexMenuItems = (fullContext: AnnotationContext, vertexId: string) => {
        const shapeId = fullContext.value.vertices[vertexId].shapeId;
        const shape = fullContext.value.shapes[shapeId].shape;

        return shapeSetupMap[shape].getVertexMenuItems(fullContext, shapeId, vertexId);
    };

    const labelColors = makeLabelColors(labels);

    return observable({
        selectedVertexId: undefined,
        selectedShapeId: undefined,
        activeLabel: labels[0]?.value,
        setActiveLabel: (ctx: AnnotationContext, index: number) => {
            const item = labels[index];

            if (!item) {
                return;
            }

            if (ctx.selection.selectedShapeId) {
                ctx.value.shapes[ctx.selection.selectedShapeId].label = item.value;
            }
            ctx.selection.activeLabel = item.value;
        },
        getMenu: (ctx: AnnotationContext) => {
            const actions = labels.map(
                (item, index): MenuItem => ({
                    label: item.label,
                    type: 'label',
                    color: labelColors[item.value],
                    checked: ctx.selection.selectedShapeId
                        ? ctx.value.shapes[ctx.selection.selectedShapeId].label === item.value
                        : item.value === ctx.selection.activeLabel,
                    onToggle: () => ctx.selection.setActiveLabel(ctx, index)
                })
            );

            if (ctx.selection.selectedShapeId) {
                actions.push(...getShapeMenuItems(ctx, ctx.selection.selectedShapeId));
            }
            if (ctx.selection.selectedVertexId) {
                actions.push(...getVertexMenuItems(ctx, ctx.selection.selectedVertexId));
            }
            if (ctx.selection.selectedShapeId || ctx.selection.selectedVertexId) {
                actions.push({
                    type: 'none',
                    checked: false,
                    label: ctx.t('deselect'),
                    onToggle: () => {
                        ctx.selection.selectedShapeId = undefined;
                        ctx.selection.selectedVertexId = undefined;
                    }
                });
            }

            if (actions.length === 0) {
                return undefined;
            }

            return actions;
        },
        getColor: (ctx: AnnotationContext, shapeId?: string) => {
            let label = null;

            if (shapeId !== undefined) {
                label = ctx.value.shapes[shapeId].label;
            }

            if (!label) {
                const activeLabel = ctx.selection.activeLabel;

                if (!activeLabel) {
                    return labels.length === 0 ? '#ed5b38' : '#cccccc';
                }

                return labelColors[activeLabel];
            }

            return labelColors[label];
        }
    });
};
