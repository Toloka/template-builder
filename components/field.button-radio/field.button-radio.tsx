import { create as createSet } from '@toloka-tb/action.set';
import { stringifyAny } from '@toloka-tb/common/utils/stringifyAny';
import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { createActionButton } from '@toloka-tb/view.action-button';
import * as React from 'react';

import styles from './field.button-radio.less';

const type = 'field.button-radio';

export type ButtonRadioProps<T = any> = {
    valueToSet: T;
} & FieldProps<T>;

export const create = (core: Core) => {
    const set = createSet(core).compile;
    const ActionButton = createActionButton(core);

    return {
        type,
        compile: core.helpers.field<ButtonRadioProps>(
            type,
            (props) => (
                <div className={styles.option} dir={props.rtl?.mode}>
                    <ActionButton
                        size="s"
                        checked={stringifyAny(props.valueToSet, true) === stringifyAny(props.value, true)}
                        action={set}
                        payload={props.valueToSet}
                        disabled={props.disabled}
                    >
                        {props.label}
                    </ActionButton>
                    {props.hint && <core.ui.Hint hint={props.hint} className={styles.hint} />}
                </div>
            ),
            { showLabel: false, showHintInLabel: false }
        )
    };
};
