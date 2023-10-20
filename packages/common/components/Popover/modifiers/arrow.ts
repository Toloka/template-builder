import { Modifier } from '@popperjs/core';
import { getBasePlacement } from './getBasePlacement';

export const arrowModifier = ({
    arrowSize,
    padding,
}: {
    arrowSize: number;
    padding: number;
}): Modifier<'arrow', {}> => ({
    name: 'arrow',
    enabled: true,
    requires: ['computeStyles'],
    phase: 'beforeWrite',
    fn: ({ state }) => {
        let arrowLeft = 0;
        let arrowTop = 0;

        const anchorWidth = state.rects.reference.width;
        const anchorHeight = state.rects.reference.height;
        const anchorLeft = state.rects.reference.x;
        const anchorTop = state.rects.reference.y;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const overlayWidth = state.rects.popper.width;
        const overlayHeight = state.rects.popper.height;
        const overlayLeft = state.modifiersData.popperOffsets?.x || 0;
        const overlayTop = state.modifiersData.popperOffsets?.y || 0;

        const placement = getBasePlacement(state.placement);

        if (['top', 'bottom'].includes(placement)) {
            arrowLeft = anchorLeft + anchorWidth / 2 - arrowSize / 2;
            if (placement === 'top') {
                arrowTop = anchorTop - arrowSize;
            } else if (placement === 'bottom') {
                arrowTop = anchorTop + anchorHeight;
            }
            if (arrowLeft < overlayLeft + padding) {
                arrowLeft = overlayLeft + padding;
            }
            if (arrowLeft > overlayLeft + overlayWidth - arrowSize - padding) {
                arrowLeft = overlayLeft + overlayWidth - arrowSize - padding;
            }

            if (arrowLeft + arrowSize > windowWidth) {
                arrowLeft = windowWidth - arrowSize;
            }
            if (arrowLeft < 0) arrowLeft = 0;
        }
        if (['left', 'right'].includes(placement)) {
            arrowTop = anchorTop + anchorHeight / 2 - arrowSize / 2;
            if (placement === 'left') {
                arrowLeft = anchorLeft - arrowSize;
            } else if (placement === 'right') {
                arrowLeft = anchorLeft + anchorWidth;
            }
            if (arrowTop < overlayTop + padding) {
                arrowTop = overlayTop + padding;
            }
            if (arrowTop > overlayTop + overlayHeight - arrowSize - padding) {
                arrowTop = overlayTop + overlayHeight - arrowSize - padding;
            }

            if (arrowTop + arrowSize > windowHeight) {
                arrowTop = windowHeight - arrowSize;
            }
            if (arrowTop < 0) arrowTop = 0;
        }

        state.styles.arrow = {
            transform: `translate(${arrowLeft}px, ${arrowTop}px)`,
            top: '0px',
            left: '0px',
            width: `${arrowSize}px`,
            height: `${arrowSize}px`,
            borderWidth: `${arrowSize / 2}px`,
            borderTopColor: placement === 'top' ? undefined : 'transparent',
            borderBottomColor: placement === 'bottom' ? undefined : 'transparent',
            borderLeftColor: placement === 'left' ? undefined : 'transparent',
            borderRightColor: placement === 'right' ? undefined : 'transparent',
        };
    },
});
