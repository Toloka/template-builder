import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.concat-arrays';

export type HelperConcatAraysProps = {
    items: unknown[];
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperConcatAraysProps, unknown[]>(({ items }: HelperConcatAraysProps) => {
            const arrays = (items || []).filter((item) => item && Array.isArray(item));

            return ([] as unknown[]).concat(...arrays);
        })
    };
};
