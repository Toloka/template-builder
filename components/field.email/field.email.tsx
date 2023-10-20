import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { TextInput } from '@toloka-tb/common/components/TextInput';
import * as React from 'react';

import translations from './i18n/field.email.translations';

const type = 'field.email';

type Props = { placeholder?: string } & FieldProps<string, string>;

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
                        placeholder={disabled ? undefined : placehodlerText}
                        disabled={disabled}
                        type="email"
                        onChange={handleChange}
                        size="s"
                    />
                );
            },
            {
                rawValue: {
                    parse: (value) => value || undefined,
                    serialize: (value) => value,
                    validate: (value, _rawValue, _props, t) => {
                        if (typeof value === 'undefined') {
                            return;
                        }

                        const isValid = value.includes('@') && value.split('@').every((part) => part.length > 0);

                        if (!isValid) {
                            return t('validationError');
                        }
                    }
                }
            }
        )
    };
};

export { translations };
