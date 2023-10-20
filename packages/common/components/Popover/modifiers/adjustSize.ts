import { Modifier } from '@popperjs/core';

export type Adjust = Partial<{
    minWidth: boolean;
    width: boolean;
    maxWidth: boolean;
    minHeight: boolean;
    height: boolean;
    maxHeight: boolean;
}>;

export const adjustSizeModifier = ({ adjust }: { adjust: Adjust }): Modifier<'adjustMinSize', {}> => ({
    name: 'adjustMinSize',
    enabled: true,
    phase: 'beforeRead',
    fn: ({ state }) => {
        const popperStyle = { ...state.styles.popper };
        const rect = state.rects.popper;

        if (adjust.minWidth) {
            popperStyle.minWidth = `${state.rects.reference.width}px`;
            if (rect.width < state.rects.reference.width) {
                rect.width = state.rects.reference.width;
            }
        }
        if (adjust.minHeight) {
            popperStyle.minHeight = `${state.rects.reference.height}px`;
            if (rect.height < state.rects.reference.height) {
                rect.height = state.rects.reference.height;
            }
        }

        if (adjust.width) {
            popperStyle.width = `${state.rects.reference.width}px`;
            if (rect.width !== state.rects.reference.width) {
                rect.width = state.rects.reference.width;
            }
        }
        if (adjust.height) {
            popperStyle.height = `${state.rects.reference.height}px`;
            if (rect.height !== state.rects.reference.height) {
                rect.height = state.rects.reference.height;
            }
        }

        if (adjust.maxWidth) {
            popperStyle.maxWidth = `${state.rects.reference.width}px`;
            if (rect.width > state.rects.reference.width) {
                rect.width = state.rects.reference.width;
            }
        }
        if (adjust.maxHeight) {
            popperStyle.maxHeight = `${state.rects.reference.height}px`;
            if (rect.height > state.rects.reference.height) {
                rect.height = state.rects.reference.height;
            }
        }

        return { ...state, styles: { ...state.styles, popper: popperStyle }, rects: { ...state.rects, popper: rect } };
    },
});
