import cn from 'classnames';
import React from 'react';
import { MouseEventHandler } from 'react';

import style from './MobileDesktopRadioButton.less';

type ButtonProps = {
    active: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const Button: React.FC<ButtonProps> = ({ active, children, onClick }) => {
    return (
        <button onClick={onClick} className={cn(style.button, active ? style.buttonActive : '')}>
            {children}
        </button>
    );
};
