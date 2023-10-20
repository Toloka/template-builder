import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import * as React from 'react';

export type ScrollPosition = { left: number; top: number; viewKey: string };
export type OnScrollChange = (scroll: ScrollPosition) => void;
export const useScrollStoring = (
    onScrollChange?: OnScrollChange,
    providedScroll?: ScrollPosition
): [(scrollContainer: HTMLDivElement | null) => void, () => void] => {
    const scroll = React.useRef({ left: 0, top: 0 });
    const scrollViewKey = React.useMemo(() => uniqueId('scroll-view'), []); // to prevent recursive scroll event firing
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const handleScrollContainerRef = React.useCallback(
        (scrollContainer: HTMLDivElement | null) => {
            if (scrollContainer) {
                const scrollListener = (event: Event) => {
                    if (event.target !== null) {
                        const left = (event.target as any).scrollLeft || 0;
                        const top = (event.target as any).scrollTop || 0;

                        if (
                            onScrollChange &&
                            providedScroll &&
                            (left !== providedScroll.left || top !== providedScroll.top)
                        ) {
                            onScrollChange({ left, top, viewKey: scrollViewKey });
                        } else {
                            scroll.current.left = left;
                            scroll.current.top = top;
                        }
                    }
                };

                scrollContainer.addEventListener('scroll', scrollListener);
                (scrollContainerRef as any).current = scrollContainer;
            }
        },
        [onScrollChange, providedScroll, scrollViewKey]
    );

    const { left: providedScrollLeft, top: providedScrollTop, viewKey: changeViewKey } = providedScroll || {};

    React.useEffect(() => {
        if (
            scrollContainerRef.current &&
            providedScrollLeft !== undefined &&
            providedScrollTop !== undefined &&
            scrollViewKey !== changeViewKey &&
            (scrollContainerRef.current.scrollLeft !== providedScrollLeft ||
                scrollContainerRef.current.scrollTop !== providedScrollTop)
        ) {
            scrollContainerRef.current.scrollLeft = providedScrollLeft;
            scrollContainerRef.current.scrollTop = providedScrollTop;
        }
    }, [changeViewKey, providedScrollLeft, providedScrollTop, scrollViewKey]);

    const scrollToStoredPosition = React.useCallback(() => {
        if (scrollContainerRef.current) {
            const { left, top } = providedScroll || scroll.current;

            if (left !== scrollContainerRef.current.scrollLeft || top !== scrollContainerRef.current.scrollTop) {
                scrollContainerRef.current.scrollLeft = left;
                scrollContainerRef.current.scrollTop = top;
            }
        }
    }, [providedScroll]);

    return [handleScrollContainerRef, scrollToStoredPosition];
};
