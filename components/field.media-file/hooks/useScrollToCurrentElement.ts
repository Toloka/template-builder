import { useEffect, useRef } from 'react';

export const useScrollToCurrentElement = (currentItemIndex: number) => {
    const thumbsListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to the current active element in the thumbs list
        const currentElement = thumbsListRef.current?.childNodes?.[currentItemIndex] as HTMLDivElement | undefined;

        if (currentElement) {
            currentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [currentItemIndex]);

    return [thumbsListRef];
};
