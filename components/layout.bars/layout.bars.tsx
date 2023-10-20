import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import styles from './layout.bars.less';

type LayoutBarsProps = {
    content: Child;
    barBefore?: Child;
    barAfter?: Child;
};

const type = 'layout.bars';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: LayoutBarsProps) => ({
                barBefore: props.barBefore,
                barAfter: props.barAfter,
                content: props.content
            }),
            (props) => (
                <div className={styles.container}>
                    {props.children.barBefore && (
                        <div className={cx(styles.bar, styles.barBefore)}>{props.children.barBefore}</div>
                    )}
                    <div className={styles.content}>{props.children.content}</div>
                    {props.children.barAfter && (
                        <div className={cx(styles.bar, styles.barAfter)}>{props.children.barAfter}</div>
                    )}
                </div>
            )
        )
    };
};
