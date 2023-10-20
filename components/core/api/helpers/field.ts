import { omit } from '@toloka-tb/common/utils/pick-omit';
import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { RTLProps } from '@toloka-tb/schemas/rtl';

import { CtxBag } from '../../ctx/ctxBag';
import { dataMap } from '../../data/map';
import { DataRW } from '../../data/rw';
import { Compiled, compiler, Getter, resolveGetters } from '../../resolveGetters/resolveGetters';
import { TranslationFunction } from '../i18n';
import {
    ComponentWithTbChildren,
    GetNormalChildren,
    GivenChildren,
    noChildren,
    normalizedChildrenGetter
} from './children';
import { ConditionResult } from './condition';

export type Transformer<T> = (value: any) => T | undefined;

// component props  (unknown extends RawValue ? Value : RawValue) means pretty much: if RawValue is defined -- use it, use value otherwise
type FieldComputedProps<Value, RawValue = unknown, TranslationKeys extends string = string> = {
    value: (unknown extends RawValue ? Value : RawValue) | undefined;
    onChange: (value: (unknown extends RawValue ? Value : RawValue) | undefined, err?: string) => void;

    __tbRawValueType?: RawValue;
    __tbValueType?: Value;
    __tbTranslationType?: TranslationKeys;
};
type FieldPassthroughProps = {
    label?: string;
    disabled?: boolean;
    hint?: string;
    requiredMark?: boolean;
} & RTLProps;
export type FieldProps<Value, RawValue = unknown, TranslationKeys extends string = string> = FieldComputedProps<
    Value,
    RawValue,
    TranslationKeys
> &
    FieldPassthroughProps &
    (Value extends boolean ? { preserveFalse?: boolean } : {});

// compiler props
type FieldCompilerProps<P extends FieldProps<any>> = Omit<P, keyof FieldComputedProps<any, any>> & {
    validation?: Getter<ConditionResult>;
    data: DataRW<P['value']>;
};

type RawValueHandlers<P extends FieldProps<any, any, any>> = {
    parse: (rawValue: P['__tbRawValueType'], props: Omit<P, 'onChange' | 'value'>) => P['__tbValueType'];
    serialize: (parsedValue: P['__tbValueType'], props: Omit<P, 'onChange' | 'value'>) => P['__tbRawValueType'];
    validate: (
        parsedValue: P['__tbValueType'],
        rawValue: P['__tbRawValueType'],
        props: P,
        t: TranslationFunction<P['__tbTranslationType']>
    ) => string | undefined;
};

type FieldOptions<P extends FieldProps<any, any>> = {
    showLabel: boolean;
    showHintInLabel: boolean;
    transformers: Array<Transformer<P['value']>>;
    unresolvableProps: Array<keyof P>;
    mapContextData: {
        mapValue: (value: P['value'], props: FieldCompilerProps<P>) => P['value'];
        mapPath: (basePath: string, props: FieldCompilerProps<P>) => string[];
    };
    ignorePreserveFalse: boolean;
} & (unknown extends P['__tbRawValueType'] ? {} : { rawValue: RawValueHandlers<P> });

// config
type Field<P extends FieldProps<any>> = {
    type: string;
    component: React.ComponentType<P>;
    props: FieldCompilerProps<P>;

    options: FieldOptions<P>;
    children: GetNormalChildren<P>;

    data: DataRW<P['value']>;
    parse?: RawValueHandlers<P>['parse'];
    serialize?: RawValueHandlers<P>['serialize'];
    validate?: RawValueHandlers<P>['validate'];

    __tbField: true;
    __tbView: true;
    __tbViewKey: string;
};

export type FieldConfig = Compiled<Field<any>>;

const getDefaultOptions = () => ({
    showLabel: true,
    showHintInLabel: true,
    transformers: [],
    unresolvableProps: []
});

export const fieldWithChildrenHelper = <Props extends FieldProps<any, any>, Children extends GivenChildren>(
    type: string,
    getChildren: (props: Props, bag: CtxBag) => Children,
    component: ComponentWithTbChildren<Props, Children>,
    givenOptions: Partial<FieldOptions<Props>> = {}
) => {
    component.displayName = type;

    const options = { ...getDefaultOptions(), ...givenOptions };

    return compiler(
        (props: FieldCompilerProps<Props>): Field<Props> => {
            let data = props.data;

            if (options.mapContextData) {
                const propsWithoutData = omit(props, ['data', 'validation']);

                data = dataMap({
                    base: props.data,
                    mapValue: (value, bag) =>
                        options.mapContextData && typeof value !== 'undefined'
                            ? options.mapContextData.mapValue(value, resolveGetters(propsWithoutData, bag))
                            : value,
                    mapPaths: (basePath, bag) =>
                        options.mapContextData
                            ? options.mapContextData.mapPath(basePath, resolveGetters(propsWithoutData, bag))
                            : [basePath]
                });
            }

            return {
                type,
                props: omit(props, 'data'),
                data,
                component: component as any,
                options: options as any,
                children: normalizedChildrenGetter(getChildren),

                parse: (options as any).rawValue?.parse,
                serialize: (options as any).rawValue?.serialize,
                validate: (options as any).rawValue?.validate,

                __tbView: true,
                __tbField: true,
                __tbViewKey: uniqueId('unrendered-view')
            };
        }
    );
};

export const fieldHelper = <Props extends FieldProps<any>>(
    type: string,
    component: ComponentWithTbChildren<Props, {}>,
    givenOptions: Partial<FieldOptions<Props>> = {}
) => fieldWithChildrenHelper(type, noChildren, component, givenOptions);
