import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.join';

export type HelperJoinProps = {
    items: string[];
    by: string;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperJoinProps, string>(({ items, by }: HelperJoinProps) => {
            return (items || []).join(by !== undefined ? by : '');
        })
    };
};
