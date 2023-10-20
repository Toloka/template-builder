import { create as createToggle } from '@toloka-tb/action.toggle';
import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { Tumbler } from '@toloka-tb/common/components/Tumbler';
import * as React from 'react';

import styles from './field.tumbler.less';

const type = 'field.tumbler';

export type FieldTumblerProps = FieldProps<boolean>;

export const create = (core: Core) => {
    const { ActionHint } = core.ui;
    const toggle = createToggle(core);

    return {
        type,
        compile: core.helpers.field(
            type,
            ({ onChange, hint, disabled, value, label }: FieldTumblerProps) => {
                const handleChange = React.useCallback(
                    (event: React.ChangeEvent<HTMLInputElement>) => {
                        onChange(event.target.checked ? true : undefined);
                    },
                    [onChange]
                );

                return (
                    <div className={styles.option}>
                        <ActionHint action={toggle.compile} className={styles.sequence} />
                        <Tumbler
                            className={styles.tumbler}
                            checked={value || false}
                            onChange={handleChange}
                            disabled={disabled}
                            labelAfter={label}
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
