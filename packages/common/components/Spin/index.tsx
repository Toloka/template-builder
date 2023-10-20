import React from 'react';
import {
    Spin as LegoSpin,
    ISpinProps,
} from '@yandex/ui/Spin/desktop/bundle';

const defaultProps: Partial<ISpinProps> = {
    view: 'default',
    size: 'm',
    progress: true,
};

export const Spin: React.FC<ISpinProps> = props => {
    return <LegoSpin {...defaultProps} {...props} />;
};

export type SpinProps = ISpinProps;
