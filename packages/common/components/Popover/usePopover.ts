import React from 'react';

import { createPopper, Instance as PopperInstnce } from '@popperjs/core';
import { VariationPlacement, BasePlacement } from '@popperjs/core/lib/enums';
import { useDeferredState } from '../../utils/useDeferredState';

import { arrowModifier } from './modifiers/arrow';
import { placeholderModifier } from './modifiers/placeholder';
import { Adjust, adjustSizeModifier } from './modifiers/adjustSize';
import { getBasePlacement } from './modifiers/getBasePlacement';
import { paddingVarModifier } from './modifiers/paddingVar';

export type PopoverTrigger = 'click' | 'hover' | 'focus';
export type PopoverPosition =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'left-top'
    | 'left-bottom'
    | 'right-top'
    | 'right-bottom';

const arrowSidePadding = 2;

type PopperPlacement = BasePlacement | VariationPlacement;
const popoverPositionToPopperPlacement: {
    [position in PopoverPosition]: PopperPlacement;
} = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    'top-left': 'top-start',
    'top-right': 'top-end',
    'bottom-left': 'bottom-start',
    'bottom-right': 'bottom-end',
    'left-top': 'left-start',
    'left-bottom': 'left-end',
    'right-top': 'right-start',
    'right-bottom': 'right-end',
};

export type UsePopoverProps<AnchorElement extends HTMLElement> = {
    visible: boolean;
    position: PopoverPosition;
    padding: number;
    showArrow: boolean;
    arrowSize: number;
    adjustSize?: Adjust;
    adjustMinWidthToAnchor?: boolean;
    adjustMinHeightToAnchor?: boolean;
    anchorRef?: React.RefObject<AnchorElement>;
    allowOffViewportPosition?: boolean;
};

const isEqual = (a: unknown, b: unknown) => {
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return a === b;
    }
    const aKeys: { [keyName: string]: true } = {};
    for (const key in a) {
        if (!(key in b)) {
            return false;
        }
        aKeys[key] = true;
        if (!isEqual((a as { [key: string]: unknown })[key], (b as { [key: string]: unknown })[key])) {
            return false;
        }
    }
    for (const key in b) {
        if (!(key in aKeys)) {
            return false;
        }
    }

    return true;
};

export const usePopover = <AnchorElement extends HTMLElement>({
    visible,
    position,
    padding: providedPadding,
    adjustSize,
    adjustMinHeightToAnchor,
    adjustMinWidthToAnchor,
    anchorRef: providedAnchorRef,
    arrowSize,
    allowOffViewportPosition,
}: UsePopoverProps<AnchorElement>) => {
    const renderOverlay = useDeferredState(visible, [true]);

    const overlayRef = React.useRef<HTMLDivElement | null>(null);
    const arrowRef = React.useRef<HTMLDivElement | null>(null);
    const placeholderRef = React.useRef<HTMLDivElement | null>(null);

    const innerAnchorRef = React.useRef<HTMLDivElement | null>(null);
    const anchorRef = providedAnchorRef || innerAnchorRef;

    const popperInstace = React.useRef<PopperInstnce | null>(null);
    const [styles, setStyles] = React.useState<{
        overlay: React.CSSProperties;
        arrow: React.CSSProperties;
        placeholder: React.CSSProperties;
    }>({
        overlay: {},
        arrow: {},
        placeholder: {},
    });

    const stylesRef = React.useRef(styles);
    stylesRef.current = styles;

    React.useLayoutEffect(() => {
        if (!anchorRef.current || !overlayRef.current || !placeholderRef.current) {
            return;
        }
        if (!renderOverlay) {
            return;
        }
        const adjust = adjustSize || {
            minWidth: adjustMinWidthToAnchor || false,
            minHeight: adjustMinHeightToAnchor || false,
        };

        const padding = Math.max(providedPadding, arrowSize);

        const baseFallbackPlacements: BasePlacement[] = ['bottom', 'right', 'left', 'top'];
        const fallbackPlacements: { [base in BasePlacement]: PopperPlacement[] } = {
            top: ['top-start', 'top-end', 'bottom'],
            right: ['right-start', 'right-end', 'left'],
            bottom: ['bottom-start', 'bottom-end', 'top'],
            left: ['left-start', 'left-end', 'right'],
        };
        const placement = popoverPositionToPopperPlacement[position];

        const resolvePositioningModifier = () => {
            const modHide = {
                name: 'hide',
                enabled: true,
            };
            const modFlip = {
                name: 'flip',
                enabled: true,
                options: {
                    padding: {
                        top: padding,
                        left: padding,
                        right: padding,
                        bottom: padding,
                    },
                    fallbackPlacements: [
                        ...fallbackPlacements[getBasePlacement(placement)],
                        ...baseFallbackPlacements,
                    ],
                },
            };

            return allowOffViewportPosition ? modHide : modFlip;
        };

        const instance = createPopper(anchorRef.current, overlayRef.current, {
            strategy: 'fixed',
            placement,
            modifiers: [
                {
                    name: 'offset',
                    enabled: true,
                    phase: 'main',
                    options: {
                        offset: () => [0, padding],
                    },
                },
                resolvePositioningModifier(),
                { name: 'preventOverflow', enabled: true, options: { padding, mainAxis: true, altAxis: true } },
                { name: 'arrow', enabled: false },
                adjustSizeModifier({ adjust }),
                arrowModifier({ arrowSize, padding: arrowSidePadding }),
                placeholderModifier({ padding, element: placeholderRef.current }),
                placeholderModifier({ padding, element: placeholderRef.current }),
                paddingVarModifier({ padding }),
                { name: 'applyStyles', enabled: false },
                {
                    name: 'setState',
                    enabled: true,
                    phase: 'write',
                    requires: ['adjustMinSize', 'arrow', 'placeholder', 'flip', 'computeStyles', 'offset'],
                    fn: ({ state }) => {
                        if (!overlayRef.current || !anchorRef.current || !placeholderRef.current) {
                            return;
                        }
                        const styles = {
                            overlay: state.styles.popper as React.CSSProperties,
                            arrow: state.styles.arrow as React.CSSProperties,
                            placeholder: state.styles.placeholder as React.CSSProperties,
                        };

                        if (!isEqual(stylesRef.current, styles)) {
                            setStyles(styles);
                        }
                    },
                },
            ],
        });

        popperInstace.current = instance;

        return instance.destroy;
    }, [
        adjustMinHeightToAnchor,
        adjustMinWidthToAnchor,
        adjustSize,
        anchorRef,
        arrowSize,
        position,
        renderOverlay,
        providedPadding,
    ]);

    return {
        styles,
        renderOverlay,
        overlayRef,
        anchorRef,
        placeholderRef,
        arrowRef,
    };
};
