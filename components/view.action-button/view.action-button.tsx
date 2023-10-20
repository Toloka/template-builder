import { ElementProps } from '@martin_hotell/rex-tils';
import { ActionCreator, ActionCreatorProps, GettableAction } from '@toloka-tb/core/api/helpers/action';
import { Core } from '@toloka-tb/core/coreComponentApi';
import { Button } from '@toloka-tb/common/components/Button';
import * as React from 'react';

import styles from './view.action-button.less';

const type = 'view.action-button';

type Props = {
    action: GettableAction;
    label: string;
    content?: string; // backwards compatibility, deprecated
    hint?: string;
};

// component for everyone to use
export const createActionButton = (core: Core) => {
    const ActionButton = <AC extends ActionCreator>(
        props: React.PropsWithChildren<ActionCreatorProps<AC> & ElementProps<typeof Button>>
    ) => {
        // ActionHint typings seems to be a bit broken, but we copy it is signature so it is fine
        const { ActionHint } = core.ui as any;

        const { action, ...rest } = props;
        const payload = (props as any).payload;

        const [act] = core.hooks.useComponentActions([action]);
        const onClick = React.useCallback(() => {
            act(payload);
        }, [act, payload]);

        return (
            <Button {...rest} size="s" onClick={onClick} className={styles.button}>
                <div className={styles.content}>
                    <ActionHint action={action} payload={payload} className={styles.sequence} dispatch={false} />
                    <div className={styles.children}>{props.children}</div>
                </div>
            </Button>
        );
    };

    return ActionButton;
};

export const create = (core: Core) => {
    const ActionButton = createActionButton(core);

    return {
        type,
        compile: core.helpers.view<Props>(
            type,
            (props) => {
                const stopPropagation = React.useCallback(
                    (event: React.MouseEvent | React.TouchEvent) => event.stopPropagation(),
                    []
                );

                return (
                    <ActionButton action={props.action}>
                        {props.content || props.label}
                        {props.hint && (
                            <div onClick={stopPropagation} onTouchStart={stopPropagation} className={styles.hint}>
                                <core.ui.Hint hint={props.hint} />
                            </div>
                        )}
                    </ActionButton>
                );
            },
            {
                showLabel: false,
                showHintInLabel: false
            }
        )
    };
};
