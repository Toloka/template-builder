import React from 'react';

import { PopoverTrigger } from './usePopover';
import { PopoverMixedEvent, isEventMixed } from './eventMixer';
import { hoverGroupContext } from './HoverGroup';

export type PopoverExtendedEvent = Event & {
    popoverAnchor: HTMLElement;
};

export const useBodyListener = ({
    trigger,
    hide,
    hoverDelay,
    timeoutRef,
    isVisibleRef,
    anchorRef,
    hoverTriggerShowTimeout,
    ignoreHover,
}: {
    trigger: PopoverTrigger;
    hide: () => void;
    hoverDelay: number;
    timeoutRef: React.MutableRefObject<number>;
    isVisibleRef: React.MutableRefObject<boolean>;
    hoverTriggerShowTimeout: React.MutableRefObject<number>;
    anchorRef: React.RefObject<HTMLElement>;
    ignoreHover: boolean;
}) => {
    const hoverGroupCtx = React.useContext(hoverGroupContext);
    const hoverGroupRef = React.useRef(hoverGroupCtx);
    hoverGroupRef.current = hoverGroupCtx;

    React.useEffect(() => {
        const commonEventHandler = (event: Event | PopoverMixedEvent) => {
            if (isEventMixed(event, anchorRef.current)) {
                return false;
            }

            window.clearTimeout(hoverTriggerShowTimeout.current);
            hoverTriggerShowTimeout.current = -1;

            return isVisibleRef.current;
        };
        const clickHandler = (event: Event | PopoverMixedEvent) => {
            const handle = commonEventHandler(event);
            if (!handle) return;
            hide();
        };
        const hoverHandler = (event: Event | PopoverMixedEvent) => {
            if (ignoreHover) return;

            const handle = commonEventHandler(event);
            if (!handle) return;

            if (isEventMixed(event, null, hoverGroupRef.current.groupId)) {
                hide();
            } else {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = window.setTimeout(() => {
                    hide();
                }, Math.min(hoverDelay, 300));
            }
        };

        document.addEventListener('click', clickHandler);
        document.addEventListener('mousemove', hoverHandler);

        return () => {
            document.removeEventListener('click', clickHandler);
            document.removeEventListener('mousemove', hoverHandler);
        };
    }, [anchorRef, hide, hoverDelay, hoverTriggerShowTimeout, ignoreHover, isVisibleRef, timeoutRef, trigger]);
};
