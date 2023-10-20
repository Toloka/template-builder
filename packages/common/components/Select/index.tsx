import React from 'react';
import {
    Select as LegoSelect,
    ISelectProps,
} from '@yandex/ui/Select/desktop/bundle';

const defaultProps: Partial<ISelectProps> = {
    view: 'default',
    size: 'm',
};

export const Select: React.FC<ISelectProps> = props => {
    return (
        // TODO: Something wrong with ISelectProps in lego
        // @ts-ignore
        <LegoSelect {...defaultProps} {...props} />
    );
};

export type SelectProps = ISelectProps;
