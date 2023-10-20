import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.sum';

export type HelperSumProps = {
    items: number[];
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperSumProps, number>(({ items }) => {
            return (items || []).reduce((sum, item) => sum + item, 0);
        })
    };
};
