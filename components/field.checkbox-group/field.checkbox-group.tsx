import { pick } from '@toloka-tb/common/utils/pick-omit';
import { Child, Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { create as createCheckbox } from '@toloka-tb/field.checkbox';
import { create as createList } from '@toloka-tb/view.list';

const type = 'field.checkbox-group';

export type Option = {
    label: string;
    value: string;
    hint?: string;
};

export type FieldCheckboxGroupProps = {
    options: Option[];
} & FieldProps<{ [key: string]: boolean }> & { preserveFalse?: boolean };

export const create = (core: Core) => {
    const checkbox = createCheckbox(core).compile;
    const list = createList(core);

    return {
        type,
        compile: core.helpers.fieldWithChildren(
            type,
            (props: FieldCheckboxGroupProps, bag) => {
                const items = (props.options.filter(Boolean).map((option) =>
                    checkbox({
                        data: core.data.sub<boolean | undefined>({
                            parent: bag.component.data,
                            path: String(option.value)
                        }),
                        disabled: props.disabled,
                        label: option.label,
                        hint: option.hint,
                        preserveFalse: props.preserveFalse
                    })
                ) as any) as Child[];

                return {
                    list: list.compile({ items, direction: 'vertical', size: 's' })
                };
            },
            (props) => props.children.list,
            {
                ignorePreserveFalse: true,
                mapContextData: {
                    mapValue: (value, props) => {
                        if (typeof value !== 'object') return value;

                        const mapped = pick(
                            value,
                            props.options.map(({ value }) => value)
                        );

                        if (Object.keys(mapped).length === 0) return undefined;

                        return mapped;
                    },
                    mapPath: (basePath, props) =>
                        props.options.map(({ value }) => [basePath, value].filter((path) => path !== '').join('.'))
                }
            }
        )
    };
};
