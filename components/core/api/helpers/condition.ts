import { omit, pick } from '@toloka-tb/common/utils/pick-omit';

import { CtxBag } from '../../ctx/ctxBag';
import { ValidationError } from '../../ctx/form';
import { makeGetter, resolveGetters } from '../../resolveGetters/resolveGetters';
import { makeTranslator, TranslationFunction } from '../i18n';

export type DetailedCondition = {
    passed: boolean;
    errorGetter: ErrorGetter;
};

type ErrorGetterFactory<P extends {}, Key extends string> = (
    t: TranslationFunction<Key>,
    props: P,
    bag: CtxBag
) => ErrorGetter;

export type ErrorResolvingDirection = 'direct' | 'opposite';
type ErrorGetter = {
    [direction in ErrorResolvingDirection]: () => ValidationError;
};
export type ConditionResult = DetailedCondition | boolean | undefined;

export type ConditionCommonProps = {
    hint?: string;
};

const makeSimpleErrorGetter = (message: string): ErrorGetter => ({
    direct: () => ({ message }),
    opposite: () => ({ message })
});

type Options<Props = {}> = Partial<{
    unresolvableProps: Array<keyof Props>;
}>;

const defaultOptions: Options<any> = {
    unresolvableProps: []
};

export const conditionHelperV2 = <P, Key extends string>(
    type: string,
    conditionHandler: (props: P & ConditionCommonProps, bag: CtxBag) => boolean,
    makeErrorGetter: ErrorGetterFactory<P, Key>,
    options: Options<P> = defaultOptions as Options<P>
) => {
    return (props: P & ConditionCommonProps) =>
        makeGetter(
            (bag: CtxBag): ConditionResult => {
                const t = makeTranslator<Key>(bag, type);
                const unresolvedProps = options.unresolvableProps ? pick(props, options.unresolvableProps) : {};
                const propsToGet = options.unresolvableProps ? omit(props, options.unresolvableProps) : { ...props };

                if (typeof (propsToGet as any).data === 'undefined' && bag.component.data.__dataType !== 'no-data') {
                    (propsToGet as any).data = bag.component.data;
                }

                const resolvedProps = resolveGetters(propsToGet, bag);

                if (typeof resolvedProps.viewState === 'undefined') {
                    resolvedProps.viewState = bag.tb.viewState[bag.component.__tbViewKey];
                }
                const computedProps = { ...unresolvedProps, ...resolvedProps };
                const passed = conditionHandler(computedProps, bag);
                const errorGetter = computedProps.hint
                    ? makeSimpleErrorGetter(computedProps.hint)
                    : makeErrorGetter(t, computedProps, bag);

                if (bag.conditionResolvingMode === 'boolean') {
                    return passed;
                } else {
                    return { passed, errorGetter };
                }
            }
        );
};

/**
 * Can be removed after TBX-833 is released
 *
 * @deprecated use `conditionHelperV2` instead.
 */
export const conditionHelper = <P, Key extends string>(
    conditionHandler: (props: P & ConditionCommonProps, bag: CtxBag) => boolean,
    makeErrorGetter: ErrorGetterFactory<P, Key>,
    options: Options<P> = defaultOptions as any
) => {
    return (props: P & ConditionCommonProps) =>
        makeGetter(
            (bag: CtxBag): ConditionResult => {
                const unresolvedProps = options.unresolvableProps ? pick(props, options.unresolvableProps) : {};
                const propsToGet = options.unresolvableProps ? omit(props, options.unresolvableProps) : { ...props };

                if (typeof (propsToGet as any).data === 'undefined' && bag.component.data.__dataType !== 'no-data') {
                    (propsToGet as any).data = bag.component.data;
                }
                if (typeof (propsToGet as any).viewState === 'undefined') {
                    (propsToGet as any).viewState = bag.tb.viewState[bag.component.__tbViewKey];
                }
                const resolvedProps = resolveGetters(propsToGet, bag);
                const computedProps = { ...unresolvedProps, ...resolvedProps };
                const passed = conditionHandler(computedProps, bag);
                const errorGetter = computedProps.hint
                    ? makeSimpleErrorGetter(computedProps.hint)
                    : (makeErrorGetter as any)(computedProps, bag);

                if (bag.conditionResolvingMode === 'boolean') {
                    return passed;
                } else {
                    return { passed, errorGetter };
                }
            }
        );
};
