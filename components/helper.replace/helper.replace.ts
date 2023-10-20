import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.replace';

export type HelperReplaceProps = {
    data: string;
    find: string;
    replace: string;
    params?: {
        replaceAll: boolean;
        regExp: boolean;
        caseInsensitive: boolean;
    };
};

const escapeRegExp = (str: string) => str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');

const defaultParams = {
    replaceAll: true,
    regExp: false,
    caseInsensitive: false
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperReplaceProps, string>(({ data, find, replace, params = defaultParams }) => {
            if (typeof data !== 'string' || typeof find !== 'string' || typeof replace !== 'string') {
                return data;
            }
            const toFind = params.regExp ? find : escapeRegExp(find);

            let flags = '';

            if (params.replaceAll) {
                flags += 'g';
            }
            if (params.caseInsensitive) {
                flags += 'i';
            }

            return data.replace(new RegExp(toFind, flags), replace);
        })
    };
};
