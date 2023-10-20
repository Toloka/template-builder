import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { TextInput, TextInputProps } from '@toloka-tb/common/components/TextInput';
import * as React from 'react';

import { useBreakMouseWheel } from './hooks/useBreakMouseWheel';
import translations from './i18n/field.number.translations';

type InputNumberProps = TextInputProps & Pick<HTMLInputElement, 'min' | 'max' | 'step'>;

const NumberTextInput: React.FC<InputNumberProps> = TextInput;

const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value as any;

    if (event.target.value === '0' || value === 0) {
        event.target.select();
    }
};

const type = 'field.number';

type Props = {
    value: number;
    placeholder?: string;
    maximum?: number;
    minimum?: number;
} & FieldProps<number, string, keyof typeof translations.ru>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<Props>(
            type,
            ({ maximum, minimum, value, placeholder, onChange }) => {
                const handleChange = React.useCallback(
                    (e: React.ChangeEvent<HTMLInputElement>): void => {
                        const value = e.target.value || '';

                        if (value.length === 0) {
                            onChange(undefined);
                        } else {
                            onChange(value);
                        }
                    },
                    [onChange]
                );
                const controlRef = useBreakMouseWheel();

                return (
                    <NumberTextInput
                        value={value || ''}
                        type="number"
                        onFocus={handleFocus}
                        onChange={handleChange}
                        min={minimum ? String(minimum) : ''}
                        max={maximum ? String(maximum) : ''}
                        step="any"
                        size="s"
                        placeholder={placeholder}
                        controlRef={controlRef}
                    />
                );
            },
            {
                rawValue: {
                    parse: (rawValue) => {
                        if (!rawValue) {
                            return;
                        }

                        const newValue = parseFloat(rawValue);

                        if (isNaN(newValue)) {
                            return undefined;
                        } else {
                            return newValue;
                        }
                    },
                    serialize: (value) => {
                        return typeof value !== 'undefined' ? value.toString() : '';
                    },
                    validate: (parsedValue, rawValue, props, t) => {
                        if (typeof parsedValue === 'undefined' && !rawValue) {
                            return;
                        }

                        if (typeof parsedValue !== 'number') {
                            return t('errorNumber');
                        }

                        if (props.maximum !== undefined && parsedValue > props.maximum) {
                            return t('errorMax', { max: String(props.maximum) });
                        }

                        if (props.minimum !== undefined && parsedValue < props.minimum) {
                            return t('errorMin', { min: String(props.minimum) });
                        }
                    }
                }
            }
        )
    };
};

export { translations };
