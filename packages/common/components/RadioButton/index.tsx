import React from 'react';
import {
    RadioButton as LegoRadioButton,
    IRadioButtonProps,
} from '@yandex/ui/RadioButton/desktop/bundle';

const defaultProps: Partial<IRadioButtonProps> = {
    view: 'default',
    size: 'm',
};

export const RadioButton: React.FC<IRadioButtonProps> = props => {
    return <LegoRadioButton {...defaultProps} {...props} />;
};

export type RadioButtonProps = IRadioButtonProps;
