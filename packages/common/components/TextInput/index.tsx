import React from 'react';
import {
    Textinput as LegoTextinput,
    ITextinputProps,
} from '@yandex/ui/Textinput/desktop/bundle';

const defaultProps: Partial<ITextinputProps> = {
    view: 'default',
    size: 'm',
};

export const TextInput: React.FC<ITextinputProps> = props => {
    return <LegoTextinput {...defaultProps} {...props} />;
};

export type TextInputProps = ITextinputProps;
