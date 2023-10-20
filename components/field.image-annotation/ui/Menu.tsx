import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { Core } from '@toloka-tb/core/coreComponentApi';
import { Button } from '@toloka-tb/common/components/Button';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { actionCreators } from '../ctx/hotkeysIntegration';
import styles from './Menu.less';

const LabelIcon = makeIcon(
    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84l3.96-5.58c.25-.35.25-.81 0-1.16l-3.96-5.58z" />
);

const DeleteIcon = makeIcon(
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1z" />
);

const CompleteIcon = makeIcon(
    <path
        xmlns="http://www.w3.org/2000/svg"
        d="M9 16.2l-3.5-3.5c-.39-.39-1.01-.39-1.4 0-.39.39-.39 1.01 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0L9 16.2z"
    />
);

const type2component = {
    label: LabelIcon,
    delete: DeleteIcon,
    confirm: CompleteIcon,
    cancel: DeleteIcon,
    none: () => null
};

const type2action = {
    confirm: actionCreators.confirm,
    cancel: actionCreators.cancel,
    label: actionCreators.setActiveLabel,
    delete: undefined,
    none: undefined
};

export const AnnotationMenu = observer<{ core: Core; ctx: AnnotationContext }>((props) => {
    const menu = props.ctx.selection.getMenu(props.ctx);

    if (!menu) {
        return null;
    }

    return (
        <>
            <div className={styles.menu}>
                {menu.map((item, idx) => {
                    const Icon = type2component[item.type];
                    const action = type2action[item.type];
                    const actionHint = action && (
                        <props.core.ui.ActionHint
                            dispatch={false}
                            action={action}
                            payload={item.type === 'label' ? idx : undefined}
                            className={styles.menuActionHint}
                        />
                    );

                    return (
                        <Button
                            key={idx}
                            checked={item.checked}
                            size={'s'}
                            view={'pseudo'}
                            className={styles.menuItem}
                            disabled={props.ctx.disabled}
                            onClick={item.onToggle}
                        >
                            {actionHint}
                            <Icon fill={item.color} />
                            {item.label}
                        </Button>
                    );
                })}
            </div>
        </>
    );
});
