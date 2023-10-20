import React from 'react';

import { PopoverTrigger } from './usePopover';
import { mixinEvent } from './eventMixer';
import { hoverGroupContext } from './HoverGroup';

export const useEventHandlers = ({
    trigger,
    show,
    hide,
    anchorRef,
    isVisibleRef,
    hoverTriggerHideTimeout,
    hoverTriggerShowTimeout,
    hoverDelay,
}: {
    trigger: PopoverTrigger;
    show: () => void;
    hide: () => void;
    anchorRef: React.RefObject<HTMLElement>;
    isVisibleRef: React.MutableRefObject<boolean>;
    hoverTriggerHideTimeout: React.MutableRefObject<number>;
    hoverTriggerShowTimeout: React.MutableRefObject<number>;
    hoverDelay: number;
}) => {
    const hoverGroupCtx = React.useContext(hoverGroupContext);
    const hoverGroupRef = React.useRef(hoverGroupCtx);
    hoverGroupRef.current = hoverGroupCtx;

    const handleScroll = React.useCallback((event: Event) => mixinEvent(event, anchorRef.current), [anchorRef]);
    const handleClick = React.useCallback(
        (event: MouseEvent) => {
            mixinEvent(event, anchorRef.current);
            if (!isVisibleRef.current && trigger === 'click') {
                show();
            }
        },
        [anchorRef, isVisibleRef, show, trigger],
    );
    const handleFocus = React.useCallback(
        (event: FocusEvent) => {
            mixinEvent(event, anchorRef.current);
            if (!isVisibleRef.current && trigger === 'focus') {
                show();
            }
        },
        [anchorRef, isVisibleRef, show, trigger],
    );
    const handleBlur = React.useCallback(() => {
        if (isVisibleRef.current && trigger === 'focus') {
            hide();
        }
    }, [hide, isVisibleRef, trigger]);
    const handleHover = React.useCallback(
        (event: MouseEvent) => {
            mixinEvent(event, anchorRef.current, hoverGroupRef.current.groupId);
            window.clearTimeout(hoverTriggerHideTimeout.current);

            if (isVisibleRef.current || trigger !== 'hover') {
                return;
            }
            if (hoverTriggerShowTimeout.current !== -1) {
                return;
            }

            if (hoverGroupRef.current.hovered) {
                show();
            } else if (hoverDelay === 0) {
                show();
                hoverTriggerShowTimeout.current = -1;
            } else {
                hoverTriggerShowTimeout.current = window.setTimeout(() => {
                    show();
                    hoverTriggerShowTimeout.current = -1;
                }, hoverDelay);
            }
        },
        [anchorRef, hoverDelay, hoverTriggerHideTimeout, hoverTriggerShowTimeout, isVisibleRef, show, trigger],
    );

    const attachEventHandler = React.useCallback(
        (node: HTMLElement) => {
            node.addEventListener('scroll', handleScroll);
            node.addEventListener('click', handleClick);
            node.addEventListener('focusin', handleFocus);
            node.addEventListener('focusout', handleBlur);
            node.addEventListener('mousemove', handleHover);

            return () => {
                node.removeEventListener('scroll', handleScroll);
                node.removeEventListener('click', handleClick);
                node.removeEventListener('focusin', handleFocus);
                node.removeEventListener('focusout', handleBlur);
                node.removeEventListener('mousemove', handleHover);
            };
        },
        [handleBlur, handleClick, handleFocus, handleHover, handleScroll],
    );

    return attachEventHandler;
};
