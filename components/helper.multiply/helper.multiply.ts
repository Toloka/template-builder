import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.multiply';

export type HelperSumProps = {
    items: number[];
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperSumProps, number>(({ items }) => {
            return (items || []).reduce((prod, item) => prod * item, 1);
        })
    };
};
