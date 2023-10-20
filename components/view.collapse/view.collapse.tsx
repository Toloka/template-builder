import { create as createOpenClose } from '@toloka-tb/action.open-close';
import { IconArrowDown } from '@toloka-tb/common/icons/arrowDown';
import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import styles from './view.collapse.less';

const type = 'view.collapse';

type Props = { content: Child; label: string; defaultOpened: boolean; hint?: string };

export const create = (core: Core) => {
    const {
        ui: { ActionHint },
        hooks: { useComponentState, useComponentActions }
    } = core;
    const openClose = createOpenClose(core).compile;

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: Props) => ({ content: props.content }),
            ({ children, label, defaultOpened, hint }) => {
                const detailsRef = React.useRef<HTMLDetailsElement>(null);
                const hintContainer = React.useRef<HTMLDivElement>(null);
                const initState = React.useMemo(
                    () => ({
                        isOpen: Boolean(defaultOpened),
                        openType: 'collapse'
                    }),
                    [defaultOpened]
                );

                const state = useComponentState(initState);
                const [callOpenClose] = useComponentActions([openClose]);

                const toggleContentIsVisible = React.useCallback(
                    // React doesn't has types for details toggle event
                    (event: React.SyntheticEvent & { target: HTMLDetailsElement }) => {
                        event.persist();
                        if (event.target === detailsRef.current && state.isOpen !== event.target.open) {
                            callOpenClose();
                        }
                    },
                    [state.isOpen, callOpenClose]
                );

                return (
                    <details
                        className={styles.container}
                        open={state.isOpen}
                        ref={detailsRef}
                        // TS thinks onToggle doesn't exist on details. But it does
                        {...{ onToggle: toggleContentIsVisible }}
                    >
                        <summary
                            className={cx(styles.header, state.isOpen && styles.headerOpen)}
                            onClick={(e) => {
                                if (
                                    hintContainer.current &&
                                    e.nativeEvent.composedPath().includes(hintContainer.current)
                                ) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className={styles.headerLabelGroup}>
                                <ActionHint action={openClose} className={styles.actionHint} />
                                <div className={styles.label}>{label}</div>
                                {hint && (
                                    <div className={styles.hint} ref={hintContainer}>
                                        <core.ui.Hint hint={hint} />
                                    </div>
                                )}
                            </div>

                            <div
                                className={cx(
                                    styles.arrowContainer,
                                    state.isOpen && styles.arrowContainerReversedDirection
                                )}
                            >
                                <IconArrowDown />
                            </div>
                        </summary>
                        <div className={styles.body}>{children.content}</div>
                    </details>
                );
            },
            {
                showLabel: false,
                showHintInLabel: false
            }
        )
    };
};
