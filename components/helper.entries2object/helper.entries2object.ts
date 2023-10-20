import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.entries2object';

export type HelperEntries2ObjectProps = {
    entries: Array<{ key: string; value: unknown }>;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperEntries2ObjectProps, object>(({ entries }: HelperEntries2ObjectProps) => {
            if (!Array.isArray(entries)) return {};

            const result: { [key: string]: unknown } = {};

            for (const entry of entries) {
                if (typeof entry === 'object' && entry !== null) {
                    result[String(entry.key)] = entry.value;
                }
            }

            return result;
        })
    };
};
