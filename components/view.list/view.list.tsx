import { Child, Core, ListProps } from '@toloka-tb/core/coreComponentApi';
import { RTLProps } from '@toloka-tb/schemas/rtl';
import * as React from 'react';

const type = 'view.list';

type ViewListProps = {
    items: Child[];
} & ListProps &
    RTLProps;

export const create = (core: Core) => {
    const { ListContainer, ListItem } = core.ui.list;

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: ViewListProps) => core.childrenFromArray(props.items),
            ({ items, children, ...restProps }) => (
                <ListContainer {...restProps}>
                    {(items || []).map((_, index) => (
                        <ListItem key={index} {...restProps}>
                            {children[index]}
                        </ListItem>
                    ))}
                </ListContainer>
            )
        )
    };
};
