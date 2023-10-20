import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.object2entries';

export type HelperObject2EntriesProps = {
    data: unknown;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperObject2EntriesProps, Array<{ key: string; value: unknown }>>(
            ({ data }: HelperObject2EntriesProps) => {
                if (typeof data !== 'object') return [];
                if (data === null) return [];

                return Object.entries(data).map(([key, value]) => ({ key, value }));
            }
        )
    };
};
