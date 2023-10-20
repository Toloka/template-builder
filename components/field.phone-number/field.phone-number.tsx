import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { TextInput } from '@toloka-tb/common/components/TextInput';
import * as React from 'react';

import translations from './i18n/field.phone-number.translations';

const type = 'field.phone-number';

type Props = { placeholder?: string } & FieldProps<string, string, keyof typeof translations.ru>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<Props>(
            name,
            ({ value, onChange, disabled, placeholder }) => {
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

                const placehodlerText = placeholder === undefined ? translations.ru.defaultPlaceholder : placeholder;

                return (
                    <TextInput
                        value={value || ''}
                        type="tel"
                        disabled={disabled}
                        placeholder={disabled ? undefined : placehodlerText}
                        onChange={handleChange}
                        size="s"
                    />
                );
            },
            {
                rawValue: {
                    parse: (rawValue) => {
                        return rawValue?.replace(/(\(|\)|-|\s)/g, '');
                    },
                    serialize: (value) => value,
                    validate: (parsed, _rawValue, _props, t) => {
                        if (typeof parsed === 'undefined') {
                            return;
                        }

                        if (typeof parsed !== 'string') {
                            return t('parseError', { parsed });
                        }

                        if (!/^\+?\d+$/.test(parsed)) {
                            return t('validationError');
                        }
                    }
                }
            }
        )
    };
};

export { translations };
