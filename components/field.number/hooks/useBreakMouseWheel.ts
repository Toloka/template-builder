import { useEffect, useRef } from 'react';

export const useBreakMouseWheel = () => {
    const controlRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const blurOnWheel = (e: WheelEvent) => (e.currentTarget as HTMLInputElement).blur();
        const currentEl = controlRef.current;

        if (!currentEl) {
            return;
        }

        currentEl.addEventListener('wheel', blurOnWheel);

        return () => currentEl.removeEventListener('wheel', blurOnWheel);
    }, []);

    return controlRef;
};
