import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.translate';

export type HelperTranslateProps = {
    key: string;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperTranslateProps, string>(({ key }: HelperTranslateProps, bag) => {
            const t = core.i18n.makeTranslator<string>(bag, 'config');

            return t(key);
        })
    };
};
