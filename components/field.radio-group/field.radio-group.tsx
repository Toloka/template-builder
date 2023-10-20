import { create as createSet } from '@toloka-tb/action.set';
import { stringifyAny } from '@toloka-tb/common/utils/stringifyAny';
import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { Radiobox } from '@toloka-tb/common/components/Radiobox';
import * as React from 'react';

import styles from './field.radio-group.less';

const type = 'field.radio-group';

export type RadioGroupProps<T = any> = { options: Array<{ label: string; value: T; hint?: string }> } & FieldProps<T>;

export const create = (core: Core) => {
    const set = createSet(core).compile;
    const { ActionHint, Hint } = core.ui;

    return {
        type,
        compile: core.helpers.field<RadioGroupProps>(type, (props) => {
            const stringifiedSelectedValue = React.useMemo(() => stringifyAny(props.value, true), [props.value]);
            const stringifiedValues = React.useMemo(
                () => props.options.filter(Boolean).map(({ value }) => stringifyAny(value, true)),
                [props.options]
            );

            return (
                <core.ui.list.ListContainer direction="vertical" size="s">
                    {props.options.filter(Boolean).map(({ label, value, hint }, index) => (
                        <core.ui.list.ListItem size="s" direction="vertical" key={index}>
                            <div className={styles.option}>
                                <ActionHint action={set} payload={value} className={styles.sequence} />

                                <Radiobox
                                    view="default"
                                    size="m"
                                    value={stringifiedSelectedValue}
                                    onChange={() => props.onChange(value)}
                                    disabled={props.disabled}
                                    className={styles.radio}
                                    options={[{ label, className: styles.radio, value: stringifiedValues[index] }]}
                                />
                                {hint && <Hint hint={hint} className={styles.hint} />}
                            </div>
                        </core.ui.list.ListItem>
                    ))}
                </core.ui.list.ListContainer>
            );
        })
    };
};
