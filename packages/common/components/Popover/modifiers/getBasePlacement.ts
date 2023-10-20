import { Placement, BasePlacement } from '@popperjs/core';

export const getBasePlacement = (placement: Placement): BasePlacement => {
    if (placement.startsWith('auto')) {
        return 'bottom';
    }

    if (placement.includes('-')) {
        return (placement.split('-')[0] as unknown) as BasePlacement;
    }
    return (placement as unknown) as BasePlacement;
};
