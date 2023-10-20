import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { RTLProps } from '@toloka-tb/schemas/rtl';

import { CtxBag } from '../../ctx/ctxBag';
import { Compiled, compiler, Getter } from '../../resolveGetters/resolveGetters';
import {
    ComponentWithTbChildren,
    GetNormalChildren,
    GivenChildren,
    noChildren,
    normalizedChildrenGetter
} from './children';
import { DetailedCondition } from './condition';

export type ViewProps<P> = P & {
    label?: string;
    hint?: string;
    requiredMark?: boolean;
} & RTLProps;

type ViewCompilerProps<P> = P & { validation?: Getter<DetailedCondition> };

type View<P> = {
    component: React.ComponentType<P>;
    props: ViewCompilerProps<P>;
    children: GetNormalChildren<P>;

    options: {
        showLabel: boolean;
        showHintInLabel: boolean;
        unresolvableProps: Array<keyof P>;
    };

    __tbView: true;
    __tbViewKey: string;
};

export type ViewConfig = Compiled<View<any>>;

const getDefaultOptions = () => ({
    unresolvableProps: [],
    showLabel: true,
    showHintInLabel: true
});

export const viewWithChildrenHelper = <Props, Children extends GivenChildren>(
    displayName: string,
    getChildren: (props: Props, bag: CtxBag) => Children,
    component: ComponentWithTbChildren<Props, Children>,
    providedOptions: Partial<View<Props>['options']> = {}
) => {
    component.displayName = displayName;

    const options = { ...getDefaultOptions(), ...providedOptions };

    return compiler(
        (props: ViewCompilerProps<Props>): View<Props> => ({
            props,
            component: component as any,
            options: options as any,
            children: normalizedChildrenGetter(getChildren),

            __tbView: true,
            __tbViewKey: uniqueId('unrendered-view')
        })
    );
};

export const viewHelper = <Props>(
    displayName: string,
    component: ComponentWithTbChildren<Props, {}>,
    givenOptions: Partial<View<Props>['options']> = {}
) => viewWithChildrenHelper(displayName, noChildren, component, givenOptions);
