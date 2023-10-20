import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { RTLProps } from '@toloka-tb/schemas/rtl';
import * as React from 'react';

import styles from './field.textarea.less';
import { LegoClear } from './LegoClear';

const type = 'field.textarea';

export type TextareaComponentProps = {
    placeholder?: string;
    rows?: number;
    resizable?: boolean;
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
} & RTLProps;

export const Textarea = (props: TextareaComponentProps) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        props.onChange(event.target.value);
    };

    return (
        <div className={styles.wrapper} dir={props.rtl?.mode}>
            <textarea
                className={styles.textarea}
                style={props.resizable === false ? { resize: 'none' } : { resize: 'vertical' }}
                rows={props.rows || 4}
                value={props.value || ''}
                disabled={props.disabled}
                onChange={handleChange}
                placeholder={props.placeholder}
            />
            {props.value && !props.disabled && (
                <button className={styles.clear} type="button" onClick={() => props.onChange('')}>
                    <LegoClear className={styles.clearIcon} />
                </button>
            )}
        </div>
    );
};

type TextareaProps = TextareaComponentProps & FieldProps<string>;

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<TextareaProps>(type, Textarea, {
            transformers: [core.fieldTransformers.emptyStringTransformer]
        })
    };
};
