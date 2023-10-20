import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.length';

export type HelperConcatAraysProps = {
    data: unknown;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperConcatAraysProps, number>(({ data }: HelperConcatAraysProps) => {
            if (Array.isArray(data)) return data.length;
            if (data === null) return 0;
            if (typeof data === 'undefined') return 0;
            if (typeof data === 'object' && data !== null) return Object.keys(data).length;

            return String(data).length;
        })
    };
};
