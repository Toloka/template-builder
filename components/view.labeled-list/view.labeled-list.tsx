import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import styles from './view.labeled-list.less';

const type = 'view.labeled-list';

type Item = {
    content: Child;
    label: string;
    hint?: string;
    centerLabel?: boolean;
};
type Props = {
    items: Item[];
    minWidth?: number;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: Props) => core.childrenFromArray(props.items.map((item) => item && item.content)),
            ({ items, children, minWidth = 500 }) => {
                const [underBreakpoint, setUnderBreakpoint] = React.useState(window.innerWidth <= minWidth);
                const resizeObserverRef = core.hooks.useResizeObserver<HTMLDivElement>(
                    ({ width }) => {
                        setUnderBreakpoint(width <= minWidth);
                    },
                    [minWidth]
                );

                return (
                    <div
                        className={cx(styles.container, underBreakpoint && styles.containerBreakpoint)}
                        ref={resizeObserverRef}
                    >
                        {items.map(
                            (item, index) =>
                                item && (
                                    <React.Fragment key={index}>
                                        <div
                                            className={cx(
                                                styles.label,
                                                underBreakpoint ? `text-s ${styles.Wrapped}` : 'text-m',
                                                item.centerLabel && styles.labelCentered
                                            )}
                                        >
                                            {item.label}
                                            {item.hint && <core.ui.Hint hint={item.hint} className={styles.hint} />}
                                        </div>
                                        <div className={styles.content}>{children[index]}</div>
                                    </React.Fragment>
                                )
                        )}
                    </div>
                );
            }
        )
    };
};
