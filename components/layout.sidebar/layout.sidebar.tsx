import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import styles from './layout.sidebar.less';

type LayoutSidebarProps = {
    content: Child;
    minWidth?: number;
    controls: Child;
    controlsWidth?: number;
    extraControls?: Child;
};

const type = 'layout.sidebar';

export const create = (core: Core) => {
    const { useResizeObserver } = core.hooks;

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: LayoutSidebarProps) => ({
                content: props.content,
                controls: props.controls,
                extraControls: props.extraControls
            }),
            ({ minWidth = 600, controlsWidth = 300, children }) => {
                const [underBreakpoint, setUnderBreakpoint] = React.useState(window.innerWidth <= minWidth);
                const resizeObserverRef = useResizeObserver<HTMLDivElement>(
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
                        <div className={styles.content}>{children.content}</div>
                        <div
                            className={cx(styles.controls, underBreakpoint && styles.controlsBreakpoint)}
                            style={{ flexBasis: controlsWidth }}
                        >
                            <div className={cx(styles.mainControls)}>{children.controls}</div>
                            {children.extraControls && (
                                <div className={styles.extraControls}>{children.extraControls}</div>
                            )}
                        </div>
                    </div>
                );
            }
        )
    };
};
