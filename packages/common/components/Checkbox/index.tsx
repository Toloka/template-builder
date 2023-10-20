import React from 'react';
import {
    Checkbox as LegoCheckbox,
    ICheckboxProps,
} from '@yandex/ui/Checkbox/desktop/bundle';

const defaultProps: Partial<ICheckboxProps> = {
    view: 'default',
    size: 'm',
};

export const Checkbox: React.FC<ICheckboxProps> = props => {
    return <LegoCheckbox {...defaultProps} {...props} />;
};

export type CheckboxProps = ICheckboxProps;
