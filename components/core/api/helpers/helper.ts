import { CtxBag } from '../../ctx/ctxBag';
import { makeGetter, resolveGetters } from '../../resolveGetters/resolveGetters';

export const helperHelper = <Props, Result>(helperFunc: (props: Props, ctxBag: CtxBag) => Result) => {
    return (props: Props) =>
        makeGetter((bag: CtxBag) => {
            const resolvedProps = resolveGetters(props as any, bag);

            return helperFunc(resolvedProps, bag);
        });
};
