import { IconClose } from '@toloka-tb/common/icons/close';
import { RTLProps } from '@toloka-tb/schemas/rtl';
import cx from 'classnames';
import * as React from 'react';

import styles from './ListLayout.less';

export type ListProps = {
    direction: 'horizontal' | 'vertical' | undefined; // to make props passing obligate
    size?: 'm' | 's';
    center?: boolean;
} & RTLProps;

export type ListItemProps = {
    onRemove?: () => void;
    removeVariant?: 'default' | 'group';
} & ListProps;

export const ListContainer: React.FC<ListProps> = (props) => {
    const directionClass = props.direction === 'horizontal' ? styles.containerHorizontal : styles.containerVertical;
    const sizeClass = props.size === 's' ? styles.containerS : styles.containerM;

    return (
        <div
            className={cx(styles.container, sizeClass, directionClass, props.center && styles.containerCenter)}
            dir={props.rtl?.mode}
        >
            {props.children}
        </div>
    );
};

export const ListItem: React.FC<ListItemProps> = (props) => {
    const directionClass = props.direction === 'horizontal' ? styles.listItemHorizontal : styles.listItemVertical;
    const itemRemoveClass = props.removeVariant === 'group' ? styles.listItemRemoveGroup : styles.listItemRemovable;
    const buttonRemoveClass = props.removeVariant === 'group' ? styles.listButtonRemoveGroup : styles.closeButton;

    const content = props.onRemove ? <div className={styles.itemContent}>{props.children}</div> : props.children;

    return (
        <div className={cx(styles.listItem, directionClass, props.onRemove && itemRemoveClass)}>
            {content}
            {props.onRemove && (
                <div className={buttonRemoveClass} onClick={props.onRemove}>
                    <IconClose />
                </div>
            )}
        </div>
    );
};
