import React from 'react';
import cx from 'classnames';
import { mixinEvent, isEventMixed } from './eventMixer';
import { useUniqueId } from './useUniqueId';

export const hoverGroupContext = React.createContext<{ hovered: boolean; groupId: string }>({
    hovered: false,
    groupId: 'null',
});

export const PopoverHoverGroup = <WrapperElement extends HTMLElement>({
    children,
    className,
    wrapperRef: providedWrapperRef,
}: {
    wrapperRef?: React.MutableRefObject<WrapperElement>;
    className?: string;
    children: React.ReactNode;
}) => {
    const groupId = useUniqueId('PopoverHoverGroup');

    const [hovered, setHovered] = React.useState(false);
    const contextValue = React.useMemo(() => ({ hovered, groupId }), [groupId, hovered]);

    const hoveredRef = React.useRef(hovered);
    hoveredRef.current = hovered;

    const innerWrapperRef = React.useRef<HTMLDivElement>(null);
    const wrapperRef = providedWrapperRef || innerWrapperRef;

    const handleMouseMove = React.useCallback(
        (event: React.MouseEvent | Event) => {
            if (!hoveredRef.current && isEventMixed(event, null, groupId)) {
                setHovered(true);
            }
            mixinEvent(event, null, groupId);
        },
        [groupId],
    );

    React.useEffect(() => {
        const wrapperNode = wrapperRef?.current;
        if (!wrapperNode) return;

        wrapperNode.addEventListener('mousemove', handleMouseMove);
        return () => wrapperNode.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove, wrapperRef]);

    const handleBodyMouseMove = React.useCallback(
        (event: Event) => {
            if (hoveredRef.current && !isEventMixed(event, null, groupId)) {
                setHovered(false);
            }
        },
        [groupId],
    );

    React.useEffect(() => {
        document.body.addEventListener('mousemove', handleBodyMouseMove, { capture: false });
        return () => document.body.removeEventListener('mousemove', handleBodyMouseMove);
    }, [handleBodyMouseMove]);

    if (!providedWrapperRef) {
        return (
            <div ref={innerWrapperRef} className={cx(className)}>
                <hoverGroupContext.Provider value={contextValue}>{children}</hoverGroupContext.Provider>
            </div>
        );
    }

    return <hoverGroupContext.Provider value={contextValue}>{children}</hoverGroupContext.Provider>;
};
