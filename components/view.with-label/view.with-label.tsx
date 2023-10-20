import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

import styles from './view.with-label.less';

const type = 'view.with-label';

type ViewWithLabelProps = {
    items: Child[];
    label: string;
    hint?: string;
};

export const create = (core: Core) => {
    const { ListContainer, ListItem } = core.ui.list;

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: ViewWithLabelProps) => core.childrenFromArray(props.items),
            ({ items, children, label, hint }) => (
                <div>
                    <div className={styles.label}>{hint && <core.ui.Hint hint={hint} label={label} />}</div>
                    <ListContainer direction="horizontal" size="s" center={true}>
                        {(items || []).map((_, index) => (
                            <ListItem key={index} direction="horizontal" size="s">
                                {children[index]}
                            </ListItem>
                        ))}
                    </ListContainer>
                </div>
            )
        )
    };
};
