import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.transform';

type HelperTransformProps = {
    items: unknown[];
    into: any;
};

export const create = (core: Core) => {
    return {
        type,
        compile: ({ items, into }: HelperTransformProps) =>
            core._lowLevel.makeGetter((bag) => {
                const input = core._lowLevel.resolveGetters<unknown[], unknown[]>(items, bag);

                if (!Array.isArray(input)) return [];

                return input.map((value, index) => {
                    const subBag = { ...bag, data: { ...bag.data, local: { ...bag.data.local, item: value, index } } };

                    return core._lowLevel.resolveGetters(into, subBag);
                });
            })
    };
};
