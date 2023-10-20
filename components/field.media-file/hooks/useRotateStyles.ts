import { mapObject } from '@toloka-tb/common/utils/mapObject';
import { CSSProperties, useMemo } from 'react';
import useMeasure from 'react-use/lib/useMeasure';

export const useRotateStyles = (rotationPositions: Record<string, number>) => {
    const [ref, { width, height }] = useMeasure<HTMLDivElement>();

    const style = useMemo<Record<string, CSSProperties>>(
        () =>
            mapObject(rotationPositions, (rotationPosition) => ({
                width: `${rotationPosition % 2 ? height : width}px`,
                height: `${rotationPosition % 2 ? width : height}px`,
                transform: `rotate(${rotationPosition * 90}deg)`
            })),
        [width, height, rotationPositions]
    );

    return [ref, style] as const;
};
