import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.contains.translations';

export type ConditionContainsProps = {
    data: any;
    in: any[] | string;
};

const type = 'condition.contains';

export const create = (core: Core) => {
    const { hideUndefined } = core.conditionUtils;

    return {
        type,
        compile: core.helpers.conditionV2<ConditionContainsProps, keyof typeof translations.ru>(
            type,
            (props) => {
                let haystack = props.in;

                if (Array.isArray(haystack)) {
                    haystack = haystack.map((item: any) => (typeof item === 'string' ? item.toLowerCase() : item));
                } else if (typeof haystack === 'string') {
                    haystack = haystack.toLowerCase();
                } else {
                    return false;
                }

                let query = props.data;

                query = typeof query === 'string' ? query.toLowerCase() : query;

                if (haystack.includes(query)) {
                    return true;
                } else {
                    return false;
                }
            },
            (t, props) => ({
                direct: () => ({
                    message: t('shouldContain', { array: hideUndefined(props.in), item: props.data })
                }),
                opposite: () => ({
                    message: t('shouldNotContain', { array: hideUndefined(props.in), item: props.data })
                })
            })
        )
    };
};

export { translations };
