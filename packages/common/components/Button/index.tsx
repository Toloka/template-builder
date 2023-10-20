import React from 'react';
import { Button as LegoButton, IButtonProps as IButtonPropsBase } from '@yandex/ui/Button/desktop/bundle';

interface IButtonProps extends IButtonPropsBase {
    url?: string;
    rel?: string;
    target?: string;
}

const defaultProps: Partial<IButtonProps> = {
    view: 'default',
    size: 'm',
};

export const Button: React.FC<IButtonProps> = props => {
    return <LegoButton {...defaultProps} {...props} />;
};

export type ButtonProps = IButtonProps;
