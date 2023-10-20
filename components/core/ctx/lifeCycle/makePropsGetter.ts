import { omit, pick } from '@toloka-tb/common/utils/pick-omit';
import { computed } from 'mobx';

import { FieldConfig, FieldProps } from '../../api/helpers/field';
import { resolveGetters } from '../../resolveGetters/resolveGetters';
import { TbNode } from './lifeCycleTypes';

const resolveFieldProps = (node: TbNode, commonProps: object) => {
    const config = node.config as FieldConfig;
    const transformers = config.options.transformers;
    const data = config.data;

    const rawValue = node.bag.tb.rawNodeValue[node.key];
    const resolved = resolveGetters(config.data, node.bag);

    const nextProps: FieldProps<any> = {
        onChange: (newRawValue: any) => {
            let nextValue = newRawValue;

            // otherwise raw value is the same as parsed value and there is no need to store it
            if (config.parse) {
                nextValue = config.parse(newRawValue, commonProps);

                node.bag.tb.rawNodeValue[node.key] = {
                    raw: newRawValue,
                    computedParsed: nextValue
                };
            }

            const transformedValue = transformers ? transformers.reduce((acc, x) => x(acc), nextValue) : nextValue;

            data.makeProxy(node.bag).value = transformedValue;
        },

        value: config.serialize
            ? rawValue && rawValue.computedParsed === resolved
                ? rawValue.raw
                : config.serialize(resolved, commonProps)
            : resolved
    };

    if (node.bag.tb.isReadOnly) {
        nextProps.disabled = true;
    }

    return nextProps;
};

const emptyProps: object = { __tbNoProps: 'Something is wrong with lifecycle' };

export const makePropsGetter = (node: TbNode) => {
    const passThroughProps = computed(() => pick(node.config.props, node.config.options.unresolvableProps));
    const propsToResolve = computed(() => {
        const toOmit = [...node.config.options.unresolvableProps, 'validation'];

        if (node.bag.tb.isReadOnly) {
            toOmit.push('placeholder');
        }

        return omit(node.config.props, toOmit);
    });

    const commonProps = computed(() => resolveGetters(propsToResolve.get(), node.bag));
    const fieldProps = computed(() =>
        '__tbField' in node.config ? resolveFieldProps(node, { ...commonProps.get(), ...passThroughProps.get() }) : {}
    );

    return computed(() => ({ ...commonProps.get(), ...passThroughProps.get(), ...fieldProps.get() }));
};

export const noPropsGetter = computed(() => emptyProps);
