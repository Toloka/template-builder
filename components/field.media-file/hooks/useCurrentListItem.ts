import { useCallback, useState } from 'react';

export const useCurrentListItem = (length: number) => {
    const [index, setIndex] = useState(0);

    const next = useCallback(() => {
        setIndex((current) => (current === length - 1 ? current : current + 1));
    }, [length]);
    const prev = useCallback(() => {
        setIndex((current) => (current === 0 ? 0 : current - 1));
    }, []);
    const setCurrentItemIndex = useCallback((index: number) => setIndex(index), []);

    return [index, setCurrentItemIndex, prev, next] as const;
};
