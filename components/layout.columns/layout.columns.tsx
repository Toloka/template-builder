import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import styles from './layout.columns.less';

const alignItemsMap = {
    top: 'flex-start',
    middle: 'center',
    bottom: 'flex-end',
    stretch: 'stretch'
};

const type = 'layout.columns';

export type LayoutColumnsProps = {
    items: Child[];
    fullHeight?: boolean;
    ratio?: number[];
    minWidth?: number;
    verticalAlign?: 'top' | 'middle' | 'bottom' | 'stretch';
};

export const create = (core: Core) => {
    const { useResizeObserver } = core.hooks;

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: LayoutColumnsProps) => core.childrenFromArray(props.items),
            ({ items, verticalAlign, ratio = [], minWidth = 600, fullHeight, children }) => {
                const [underBreakpoint, setUnderBreakpoint] = React.useState(window.innerWidth <= minWidth);
                const resizeObserverRef = useResizeObserver<HTMLDivElement>(
                    ({ width }) => {
                        setUnderBreakpoint(width <= minWidth);
                    },
                    [minWidth]
                );

                return (
                    <div
                        className={cx(
                            styles.columnLayout,
                            fullHeight && styles.columnLayoutFullHeight,
                            underBreakpoint && styles.columnLayoutBreakpoint
                        )}
                        style={{
                            alignItems:
                                !underBreakpoint && verticalAlign ? alignItemsMap[verticalAlign] : alignItemsMap.stretch
                        }}
                        ref={resizeObserverRef}
                    >
                        {items.map((_, index) => {
                            if (!children[index]) return null; // do not display styles for columns hidden by helper:if

                            const inlineStyles: React.CSSProperties = { flex: `${ratio[index] || 1} 0` };
                            let marginCls = styles.column;

                            if (underBreakpoint) {
                                inlineStyles.flex = '0';
                                marginCls = styles.listItem;
                            }

                            return (
                                <div
                                    key={index}
                                    className={cx(marginCls, !underBreakpoint && fullHeight && styles.columnFullHeight)}
                                    style={inlineStyles}
                                >
                                    {children[index]}
                                </div>
                            );
                        })}
                    </div>
                );
            }
        )
    };
};
