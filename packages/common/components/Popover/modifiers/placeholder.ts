import { Modifier } from '@popperjs/core';
import { getBasePlacement } from './getBasePlacement';

export const placeholderModifier = ({
    padding,
}: {
    padding: number;
    element: HTMLElement;
}): Modifier<'placeholder', {}> => ({
    name: 'placeholder',
    enabled: true,
    requires: ['computeStyles', 'arrow'],
    phase: 'beforeWrite',
    fn: ({ state }) => {
        const placement = getBasePlacement(state.placement);

        const anchorWidth = state.rects.reference.width;
        const anchorHeight = state.rects.reference.height;
        const anchorLeft = state.rects.reference.x;
        const anchorTop = state.rects.reference.y;

        const overlayWidth = state.rects.popper.width;
        const overlayHeight = state.rects.popper.height;
        const overlayLeft = state.modifiersData.popperOffsets?.x || 0;
        const overlayTop = state.modifiersData.popperOffsets?.y || 0;

        const placeholderWidth = ['top', 'bottom'].includes(placement) ? Math.min(overlayWidth, anchorWidth) : padding;
        const placeholderHeight = ['left', 'right'].includes(placement)
            ? Math.min(overlayHeight, anchorHeight)
            : padding;

        let placeholderLeft = 0;
        let placeholderTop = 0;

        if (placement === 'top') {
            placeholderTop = overlayTop + overlayHeight;
            placeholderLeft = Math.max(overlayLeft, anchorLeft);
        } else if (placement === 'right') {
            placeholderTop = Math.max(overlayTop, anchorTop);
            placeholderLeft = overlayLeft - placeholderWidth;
        } else if (placement === 'bottom') {
            placeholderTop = overlayTop - placeholderHeight;
            placeholderLeft = Math.max(overlayLeft, anchorLeft);
        } else if (placement === 'left') {
            placeholderTop = Math.max(overlayTop, anchorTop);
            placeholderLeft = overlayLeft + overlayWidth;
        }

        state.styles.placeholder = {
            left: `${placeholderLeft}px`,
            top: `${placeholderTop}px`,
            width: `${placeholderWidth}px`,
            height: `${placeholderHeight}px`,
        };
    },
});
