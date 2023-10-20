import { ComponentConfig } from '../../coreComponentApi';
import { CtxBag } from '../../ctx/ctxBag';

export type Child = { config: ComponentConfig; bag: CtxBag };
export type GivenChildren = { [key: string]: Child | ComponentConfig | undefined };

export type GetNormalChildren<P> = (props: P, bag: CtxBag) => { [key: string]: Child };

export type ComponentWithTbChildren<P, C> = ((
    props: P & { children: { [K in keyof C]: JSX.Element } }
) => React.ReactNode) & {
    displayName?: string;
};

export const noChildren = () => ({});
export const normalizedChildrenGetter = <P>(
    denormalizedGetter: (p: P, bag: CtxBag) => GivenChildren
): GetNormalChildren<P> => (props: P, bag: CtxBag) => {
    const children = denormalizedGetter(props, bag);

    for (const key in children) {
        if (!children[key]) {
            delete children[key];

            // eslint-disable-next-line no-continue
            continue;
        }

        if ('__tbView' in children[key]!) {
            children[key] = { config: children[key] as any, bag };
        }
    }

    return children as any;
};
