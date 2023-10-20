import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { TextInput } from '@toloka-tb/common/components/TextInput';
import * as React from 'react';

const type = 'field.text';

type FieldTextProps = FieldProps<string> & {
    placeholder: string;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<FieldTextProps>(
            type,
            (props) => (
                <div dir={props.rtl?.mode}>
                    <TextInput
                        type="text"
                        size="s"
                        value={typeof props.value !== 'undefined' ? String(props.value) : ''}
                        onChange={(e) => props.onChange(e.target.value)}
                        hasClear={true}
                        placeholder={props.placeholder}
                        disabled={props.disabled}
                    />
                </div>
            ),
            {
                transformers: [core.fieldTransformers.emptyStringTransformer]
            }
        )
    };
};
