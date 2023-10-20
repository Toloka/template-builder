import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { Select } from '@toloka-tb/common/components/Select';
import * as React from 'react';

const type = 'field.multi-select';

export type Props<T = any> = { placeholder?: string; options: Array<{ label: string; value: T }> } & FieldProps<T[]>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<Props>(type, (props) => {
            const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const value: string[] | string = e.target.value;

                if (typeof value !== 'string') {
                    props.onChange(value);
                } else {
                    props.onChange([value]);
                }
            };

            return (
                <div>
                    <Select
                        value={
                            props.value === undefined ? [] : Array.isArray(props.value) ? props.value : [props.value]
                        }
                        onChange={handleChange}
                        placeholder={props.placeholder || '—'}
                        size="s"
                        options={props.options.map((option) => ({
                            value: option.value,
                            content: option.label || option.value
                        }))}
                    />
                </div>
            );
        })
    };
};
