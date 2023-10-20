import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import styles from './view.group.less';

const type = 'view.group';

export type ViewGroupProps = { content: Child; label: string; hint?: string };

export const Group: React.FC<{ label: React.ReactNode }> = (props) => (
    <div className={cx(styles.group, 'shadow-outlined')}>
        {props.label && <h5 className={cx('h5', styles.label)}>{props.label}</h5>}
        {props.children}
    </div>
);

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: ViewGroupProps) => ({
                content: props.content
            }),
            (props) => (
                <Group
                    {...props}
                    label={
                        (typeof props.label !== 'undefined' || props.hint) && (
                            <>
                                {typeof props.label !== 'undefined' && <span>{props.label}</span>}
                                {props.hint && (
                                    <div className={styles.hint}>
                                        <core.ui.Hint hint={props.hint} />
                                    </div>
                                )}
                            </>
                        )
                    }
                >
                    {props.children.content}
                </Group>
            ),
            {
                showHintInLabel: false,
                showLabel: false
            }
        )
    };
};
