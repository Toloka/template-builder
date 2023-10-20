import { CompilationHook, CompileConfig, JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';
import { TbNode } from '@toloka-tb/core/ctx/lifeCycle/lifeCycleTypes';
import { TbCtx } from '@toloka-tb/core/ctx/tbCtx';
import { ComponentType, ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react';

export type CertainPartial<T extends object, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// public
export type TbJsonConfig = Readonly<{
    readonly view: object;
    readonly plugins?: ReadonlyArray<{ readonly type: string }>;
    readonly _tbConfig?: 'tbJsonConfig';
}>;
export type TbConfig = { readonly _tbConfig?: 'tbConfig' };
export type TbContext = {
    isFocused: boolean;
    isReadOnly: boolean;
    isTouched: boolean;
    isValid: boolean;
    showAllErrors: boolean;

    hintPosition?: string;

    input: object;

    tree: TbNode;
    output: {
        value: { [key: string]: unknown };
    };
    internal: {
        value: { [key: string]: unknown };
    };

    closeAllPopups: () => void;
    destroy: () => void;
    submit: () => object;

    Component: TbReactComponent;
};
export type TbReactComponent = ForwardRefExoticComponent<
    {
        ctx: TbContext;
        children?: ReactNode;
        onFocus?: () => void;
        onSubmit?: (value: object) => void;
        onChange?: () => void;
        errorView?: ComponentType<{ error: Error }>;
        onError?: (error: Error) => void;
    } & RefAttributes<HTMLFormElement>
>;

// @internal
type CoreCompiledConfig = ReturnType<CompileConfig>;

// @internal
export type Tb2CoreType<TbType> = TbType extends TbJsonConfig
    ? JSONConfig
    : TbType extends TbConfig
    ? CoreCompiledConfig
    : TbType extends TbContext
    ? TbCtx
    : never;

// @internal
export type Core2TbType<CoreType> = CoreType extends CoreCompiledConfig
    ? TbConfig
    : CoreType extends TbCtx
    ? TbContext
    : never;

export { CompilationHook };
export { Lock, Translations, Intl } from './providers/providerDomain';
