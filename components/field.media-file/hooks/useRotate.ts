import { useCallback, useState } from 'react';

export const useRotate = () => {
    const [rotationPositions, setRotationPos] = useState<Record<string, number>>({});
    const onRotate = useCallback((id: string) => {
        setRotationPos((current) => ({ ...current, [id]: ((current[id] ?? 0) + 1) % 4 }));
    }, []);
    const resetRotate = useCallback((id: string) => {
        setRotationPos((current) => ({ ...current, [id]: 0 }));
    }, []);

    return [rotationPositions, onRotate, resetRotate] as const;
};
