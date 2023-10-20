import { useObserver } from 'mobx-react-lite';
import * as React from 'react';

import { Form } from '../ctx/form';
import { TbCtx } from '../ctx/tbCtx';
import { ErrorBoundary } from '../Error/ErrorBoundary';
import { RenderTBComponent } from '../RenderTBComponent/RenderTBComponent';
import styles from './Tb.less';

export type TbProps = {
    ctx: TbCtx;
    children?: React.ReactNode;
    onFocus?: () => void;
    onSubmit?: (value: Form['value']) => void;
    errorView?: React.ComponentType<{ error: Error }>;
    onError?: (error: Error) => void;
};

const InstanceCore: React.RefForwardingComponent<HTMLFormElement, TbProps> = (
    { ctx, children, onSubmit, onFocus },
    ref
) => {
    const handleSubmit = React.useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            const value = ctx.submit();

            if (onSubmit && ctx.isValid) {
                onSubmit(value);
            }
        },
        [ctx, onSubmit]
    );

    const root = useObserver(() => ctx.tree);

    if (!root) {
        if (ctx.config.view && '__tbGettable' in ctx.config.view) {
            if (ctx)
                // these should definitely be well explained in editor. No need to add runtime translations for these
                return (
                    <>
                        ERROR: Template is using helper.* or data.* component in root view. FIX: If your are using
                        helper.if or helper.switch in the root view, please add &quot;else&quot; or &quot;default&quot;
                        property for the root helper.
                    </>
                );
        }

        return <>ERROR: ctx was not initialized or has no root view</>;
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} onFocus={onFocus} ref={ref} tabIndex={0}>
            <RenderTBComponent node={root} />
            {children || <button type="submit" hidden={true} />}
        </form>
    );
};

const Instance = React.forwardRef(InstanceCore);

const TbWithErrorBoundary: React.RefForwardingComponent<HTMLFormElement, TbProps> = (props, ref) => {
    const { onError, errorView, ...tbProps } = props;

    return (
        <ErrorBoundary onError={onError} errorView={errorView} seed={props.ctx}>
            <Instance {...tbProps} ref={ref} />
        </ErrorBoundary>
    );
};

export const Tb = React.memo(React.forwardRef(TbWithErrorBoundary));
