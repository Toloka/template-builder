import { create as createToggle } from '@toloka-tb/action.toggle';
import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { Checkbox } from '@toloka-tb/common/components/Checkbox';
import * as React from 'react';

import styles from './field.checkbox.less';

const type = 'field.checkbox';

export type FieldCheckboxProps = FieldProps<boolean>;

export const create = (core: Core) => {
    const { ActionHint } = core.ui;
    const toggle = createToggle(core);

    return {
        type,
        compile: core.helpers.field(
            type,
            ({ onChange, hint, disabled, value, label }: FieldCheckboxProps) => {
                const handleChange = React.useCallback(
                    (event: React.ChangeEvent<HTMLInputElement>) => {
                        onChange(event.target.checked ? true : undefined);
                    },
                    [onChange]
                );

                return (
                    <div className={styles.option}>
                        <ActionHint action={toggle.compile} className={styles.sequence} />
                        <Checkbox
                            size="m"
                            className={styles.checkbox}
                            checked={value || false}
                            onChange={handleChange}
                            disabled={disabled}
                            label={label}
                        />
                        {hint && <core.ui.Hint hint={hint} className={styles.hint} />}
                    </div>
                );
            },
            {
                showLabel: false,
                showHintInLabel: false
            }
        )
    };
};
