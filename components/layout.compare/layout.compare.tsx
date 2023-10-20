import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import styles from './layout.compare.less';

type LayoutCompareProps = {
    items: Array<{ content: Child; controls?: Child }>;
    commonControls?: Child;
    wideCommonControls?: boolean;

    minWidth?: number;
};

const type = 'layout.compare';

export const create = (core: Core) => {
    const { useResizeObserver } = core.hooks;

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: LayoutCompareProps) =>
                Object.assign(
                    core.childrenFromArray(
                        props.items.map(({ content }) => content),
                        'content_'
                    ),
                    core.childrenFromArray(
                        props.items.map(({ controls }) => controls!),
                        'controls_'
                    ),
                    { commonControls: props.commonControls }
                ),
            ({ minWidth = 500, wideCommonControls, items = [], children }) => {
                const [underBreakpoint, setUnderBreakpoint] = React.useState(window.innerWidth <= minWidth);
                const resizeObserverRef = useResizeObserver<HTMLDivElement>(
                    ({ width }) => {
                        setUnderBreakpoint(width <= minWidth);
                    },
                    [minWidth]
                );

                return (
                    <div className={cx(styles.container)} ref={resizeObserverRef}>
                        <div className={cx(styles.options, underBreakpoint && styles.optionsUnderBreakpoint)}>
                            {items.map((_item, index) => (
                                <div
                                    key={index}
                                    className={cx(styles.option, underBreakpoint && styles.optionUnderBreakpoint)}
                                >
                                    {children[`content_${index}`]}
                                    {children[`controls_${index}`] && (
                                        <div
                                            className={cx(
                                                styles.optionControl,
                                                !underBreakpoint && index === 0 && styles.optionControlStart,
                                                !underBreakpoint &&
                                                    index === items.length - 1 &&
                                                    styles.optionControlEnd
                                            )}
                                        >
                                            {children[`controls_${index}`]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {children.commonControls && (
                            <div
                                className={cx(
                                    styles.commonControls,
                                    wideCommonControls && styles.commonControlsWide,
                                    underBreakpoint && styles.commonControlsUnderBreakpoint
                                )}
                            >
                                {children.commonControls}
                            </div>
                        )}
                    </div>
                );
            }
        )
    };
};
