import { Modifier } from '@popperjs/core';

export const paddingVarModifier = ({ padding = 0 }: { padding: number }): Modifier<'paddingVar', {}> => ({
    name: 'paddingVar',
    enabled: true,
    requires: [],
    phase: 'beforeWrite',
    fn: ({ state }) => {
        state.styles.popper = ({
            ...state.styles.popper,
            '--cc-popover-padding-value': `${padding}px`,
        } as unknown) as Partial<CSSStyleDeclaration>;
    },
});
