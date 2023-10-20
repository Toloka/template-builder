// was never used as far as i recall, why would we need this when we have field.checkbox
import { create as createToggle } from '@toloka-tb/action.toggle';
import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { createActionButton } from '@toloka-tb/view.action-button';
import * as React from 'react';

import styles from './field.button-checkbox.less';

const type = 'field.button-checkbox';

export type ButtonCheckboxProps = FieldProps<boolean>;

export const create = (core: Core) => {
    const toggle = createToggle(core).compile;
    const ActionButton = createActionButton(core);

    return {
        type,
        compile: core.helpers.field<ButtonCheckboxProps>(
            type,
            (props) => (
                <div className={styles.option}>
                    <ActionButton size="s" checked={props.value} action={toggle}>
                        {props.label}
                    </ActionButton>
                    {props.hint && <core.ui.Hint hint={props.hint} />}
                </div>
            ),
            { showLabel: false, showHintInLabel: false }
        )
    };
};
