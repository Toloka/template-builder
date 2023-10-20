import cx from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import { isBrowser } from './isBrowser';
import './Popover.css';
import { useBodyListener } from './useBodyListener';
import { useEventHandlers } from './useEventHandlers';
import { PopoverTrigger, usePopover, UsePopoverProps } from './usePopover';

export type PopoverProps<AnchorElement extends HTMLElement = HTMLDivElement> = {
    content: React.ReactNode;
    className?: string;
    anchorClassName?: string;
    arrowClassName?: string;
    placeholderClassName?: string;
    onRequestOpen?: () => void;
    onRequestClose?: () => void;
    hoverDelay?: number;
    moveOnScroll?: boolean;
    trigger?: PopoverTrigger;
    allowOffViewportPosition?: boolean;
} & Partial<UsePopoverProps<AnchorElement>>;

const defaultArrowSize = 10;

export const Popover: React.FC<PopoverProps> = ({
    children,
    content,
    onRequestOpen: onOpen,
    onRequestClose: onClose,
    visible,
    position = 'bottom',
    showArrow = true,
    padding = 10,
    hoverDelay = 1200,
    trigger = 'click',
    arrowSize = defaultArrowSize,
    className,
    anchorClassName,
    arrowClassName,
    placeholderClassName,
    adjustMinWidthToAnchor = false,
    adjustMinHeightToAnchor = false,
    moveOnScroll = false,
    anchorRef: providedAnchorRef,
    adjustSize,
    allowOffViewportPosition = false,
}) => {
    const [uncontrolledVisible, setUncontrolledVisible] = React.useState(false);
    const isUncontrolled = visible === undefined;
    const isVisible = (isUncontrolled ? uncontrolledVisible : visible) || false;

    const hide = React.useCallback(() => {
        if (isUncontrolled) {
            setUncontrolledVisible(false);
        }
        if (onClose) {
            onClose();
        }
    }, [isUncontrolled, onClose]);
    const show = React.useCallback(() => {
        if (isUncontrolled) {
            setUncontrolledVisible(true);
        }
        if (onOpen) {
            onOpen();
        }
    }, [isUncontrolled, onOpen]);

    const isVisibleRef = React.useRef(isVisible);

    isVisibleRef.current = isVisible;

    const hoverTriggerHideTimeout = React.useRef<number>(-1);
    const hoverTriggerShowTimeout = React.useRef<number>(-1);

    const { styles, renderOverlay, overlayRef, placeholderRef, anchorRef, arrowRef } = usePopover({
        adjustMinHeightToAnchor,
        adjustMinWidthToAnchor,
        adjustSize,
        position,
        padding,
        visible: isVisible,
        showArrow,
        arrowSize,
        anchorRef: providedAnchorRef,
        allowOffViewportPosition,
    });

    const attachEventHandler = useEventHandlers({
        trigger,
        show,
        hide,
        anchorRef,
        isVisibleRef,
        hoverTriggerHideTimeout,
        hoverTriggerShowTimeout,
        hoverDelay,
    });

    useBodyListener({
        hide,
        trigger,
        anchorRef,
        isVisibleRef,
        hoverDelay,
        timeoutRef: hoverTriggerHideTimeout,
        hoverTriggerShowTimeout,
        ignoreHover: moveOnScroll || trigger !== 'hover',
    });

    React.useLayoutEffect(() => {
        if (providedAnchorRef?.current) {
            const anchor = providedAnchorRef.current;
            if (anchorClassName && !anchor.classList.contains(anchorClassName)) {
                anchor.className = cx(anchor.className, anchorClassName);
            }
            if (!anchor.hasAttribute('aria-haspopup')) {
                anchor.setAttribute('aria-haspopup', 'true');
            }
        }

        if (!isVisible) {
            const detachEventHandlers = [anchorRef, providedAnchorRef]
                .filter(ref => ref?.current)
                .map(ref => attachEventHandler(ref!.current!));

            return () => detachEventHandlers.forEach(detach => detach());
        }
    }, [anchorClassName, anchorRef, arrowRef, attachEventHandler, isVisible, overlayRef, providedAnchorRef]);

    React.useEffect(() => {
        if (renderOverlay) {
            const detachEventHandlers = [overlayRef, placeholderRef, arrowRef]
                .filter(ref => ref?.current)
                .map(ref => attachEventHandler(ref!.current!));

            return () => detachEventHandlers.forEach(detach => detach());
        }
    }, [arrowRef, attachEventHandler, overlayRef, placeholderRef, renderOverlay]);

    const cls = React.useMemo(
        () => ({
            anchor: cx(anchorClassName),
            placeholder: cx('cc-popover__placeholder', placeholderClassName),
            overlay: cx('cc-popover__overlay', 'cc-popover_init-hidden', isVisible && 'cc-popver_visible', className),
            arrow: cx('cc-popover__arrow', 'cc-popover_init-hidden', isVisible && 'cc-popver_visible', arrowClassName),
        }),
        [anchorClassName, arrowClassName, className, isVisible, placeholderClassName],
    );

    return (
        <>
            {providedAnchorRef ? (
                children
            ) : (
                <div className={cls.anchor} ref={anchorRef} aria-haspopup>
                    {children}
                </div>
            )}
            {renderOverlay &&
                isBrowser() &&
                ReactDOM.createPortal(
                    <>
                        <div aria-hidden className={cls.placeholder} style={styles.placeholder} ref={placeholderRef} />
                        <div
                            aria-hidden={!isVisible}
                            className={cls.overlay}
                            ref={overlayRef}
                            tabIndex={0}
                            role="dialog"
                            style={styles.overlay}
                        >
                            {content}
                        </div>
                        {showArrow && <div aria-hidden className={cls.arrow} ref={arrowRef} style={styles.arrow} />}
                    </>,
                    document.body,
                )}
        </>
    );
};
