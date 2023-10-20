import { DesktopIcon } from '@toloka-tb/common/icons/desktopIcon';
import { MobileIcon } from '@toloka-tb/common/icons/mobileIcon';
import React from 'react';
import { useCallback, useState } from 'react';

import { Button } from './Button';
import style from './MobileDesktopRadioButton.less';

export type MobileOrDesktop = 'MOBILE' | 'DESKTOP';

type MobileDesktopRadioButtonProps = {
    defaultValue?: MobileOrDesktop;
    onChange: (value: MobileOrDesktop) => void;
};

export const MOBILE_WIDTH = 376;

export const MobileDesktopRadioButton: React.FC<MobileDesktopRadioButtonProps> = ({
    defaultValue = 'MOBILE',
    onChange
}) => {
    const [value, setValue] = useState<MobileOrDesktop>(defaultValue);

    const setMobileValue = useCallback(() => {
        setValue('MOBILE');
        onChange('MOBILE');
    }, [onChange, setValue]);

    const setDesktopValue = useCallback(() => {
        setValue('DESKTOP');
        onChange('DESKTOP');
    }, [onChange, setValue]);

    return (
        <div className={style.container}>
            <Button onClick={setMobileValue} active={value === 'MOBILE'}>
                <MobileIcon fill={value === 'MOBILE' ? '#000000' : 'rgba(30, 33, 38, 0.6)'} />
            </Button>
            <Button onClick={setDesktopValue} active={value === 'DESKTOP'}>
                <DesktopIcon fill={value === 'DESKTOP' ? '#000000' : 'rgba(30, 33, 38, 0.6)'} />
            </Button>
        </div>
    );
};
