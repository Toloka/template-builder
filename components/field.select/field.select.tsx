import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { Select } from '@toloka-tb/common/components/Select';
import * as React from 'react';

const type = 'field.select';

export type Props<T = any> = { placeholder?: string; options: Array<{ label: string; value: T }> } & FieldProps<T>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<Props>(type, (props) => {
            const handleChange = React.useCallback(
                (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const { value } = e.target;
                    const valueIndex = parseInt(value, 10);

                    if (!isNaN(valueIndex)) {
                        const newValue = props.options[valueIndex] && props.options[valueIndex].value;

                        props.onChange(newValue);
                    }
                },
                [props]
            );

            const options = React.useMemo(
                () =>
                    [
                        props.value !== undefined ? { value: '-1', content: '-' } : undefined,
                        ...props.options.map((option, index) => ({
                            value: String(index),
                            content: option.label || option.value
                        }))
                    ].filter(Boolean) as Array<{
                        value: any;
                        content: any;
                    }>,
                [props.options, props.value]
            );

            const selectedValueIndex = React.useMemo(() => {
                const index = props.options.findIndex((option) => option.value === props.value);

                if (index === -1) return undefined;

                return String(index);
            }, [props.options, props.value]);

            return (
                <div style={{ position: 'relative' }}>
                    <Select
                        value={selectedValueIndex}
                        onChange={handleChange}
                        placeholder={props.placeholder || '—'}
                        size="s"
                        options={options}
                    />
                </div>
            );
        })
    };
};
