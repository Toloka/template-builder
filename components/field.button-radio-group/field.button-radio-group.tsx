import { Child, Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { create as createButtonRadio } from '@toloka-tb/field.button-radio';
import { create as createList } from '@toloka-tb/view.list';

const type = 'field.button-radio-group';

export type Option = {
    label: string;
    value: string;
    hint?: string;
};

export type FieldButtonRadioGroupProps = {
    options: Option[];
} & FieldProps<unknown>;

export const create = (core: Core) => {
    const buttonRadio = createButtonRadio(core).compile;
    const list = createList(core).compile;

    return {
        type,
        compile: core.helpers.fieldWithChildren(
            type,
            (props: FieldButtonRadioGroupProps, bag) => {
                const items = (props.options.filter(Boolean).map((option) =>
                    buttonRadio({
                        data: bag.component.data,
                        valueToSet: option.value,
                        label: option.label,
                        hint: option.hint,
                        disabled: props.disabled
                    })
                ) as any) as Child[];

                return {
                    list: list({ items, direction: 'horizontal', size: 's', rtl: props.rtl })
                };
            },
            (props) => props.children.list
        )
    };
};
