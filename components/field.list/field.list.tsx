import { create as createPush } from '@toloka-tb/action.list-push';
import { create as createRemove } from '@toloka-tb/action.list-remove';
import { Child, ComponentConfig, Core, FieldProps, ListProps } from '@toloka-tb/core/coreComponentApi';
import { createActionButton } from '@toloka-tb/view.action-button';
import * as React from 'react';

import translations from './i18n/field.list.translations';

const type = 'field.list';

export type Props = {
    render: ComponentConfig;
    addedItems: Child[];
    buttonLabel: string;
    maxLength?: number;
    minLength?: number;
    editable?: boolean;
    removeVariant: 'default' | 'group';
} & FieldProps<any[] | undefined> &
    ListProps;

export const create = (core: Core) => {
    const { ListItem, ListContainer } = core.ui.list;
    const listPush = createPush(core).compile;
    const listRemove = createRemove(core).compile;
    const ActionButton = createActionButton(core);

    return {
        type,
        compile: core.helpers.fieldWithChildren<Props, any>(
            type,
            (props, bag) => {
                const children: { [key: string]: Child } = {};
                const value = props.value || [];

                for (let i = 0; i < value.length; ++i) {
                    const itemBag: typeof bag = {
                        ...bag,
                        data: {
                            local: {
                                ...bag.data.local,
                                item: value[i],
                                index: i
                            },
                            relative: [
                                ...bag.data.relative,
                                core.data.sub({
                                    parent: bag.component.data,
                                    path: String(i)
                                })
                            ]
                        }
                    };

                    children[i] = core._lowLevel.resolveGetters(props.render, itemBag);
                }

                (props.addedItems || []).forEach((child, i) => {
                    children[`added-${i}`] = child;
                });

                return children;
            },
            ({
                buttonLabel,
                minLength,
                maxLength,
                editable = true,
                size,
                direction = 'vertical',
                removeVariant = 'default',
                value,
                children,
                addedItems
            }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);
                const items = Array.isArray(value) ? value : [];
                const [onRemove] = core.hooks.useComponentActions([listRemove]);
                const hasEnoughItems = items.length > (minLength || 0);

                return (
                    <ListContainer direction={direction} size={size}>
                        {items.map((_, i) => (
                            <ListItem
                                key={i}
                                onRemove={editable && hasEnoughItems ? () => onRemove(i) : undefined}
                                removeVariant={removeVariant}
                                direction={direction}
                            >
                                {children[i]}
                            </ListItem>
                        ))}
                        {addedItems &&
                            addedItems.map((_, i) => (
                                <ListItem key={`added-${i}`} direction={direction}>
                                    {children[`added-${i}`]}
                                </ListItem>
                            ))}
                        {(maxLength === undefined || maxLength > items.length) && editable && (
                            <ListItem direction={direction} size={size}>
                                <ActionButton size="s" action={listPush} payload={undefined}>
                                    {buttonLabel || t('add')}
                                </ActionButton>
                            </ListItem>
                        )}
                    </ListContainer>
                );
            },
            {
                unresolvableProps: ['render']
            }
        )
    };
};

export { translations };
