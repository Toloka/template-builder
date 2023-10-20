import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.same-domain.translations';

export type ConditionSameDomainProps = {
    data: any;
    original: any;
};

const type = 'condition.same-domain';

const getNormalizedOrigin = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (err) {
        /* this is ok, data might be dirty */
    }

    return url;
};

export const create = (core: Core) => {
    const { hideUndefined } = core.conditionUtils;

    return {
        type,
        compile: core.helpers.conditionV2<ConditionSameDomainProps, keyof typeof translations.ru>(
            type,
            (props) => getNormalizedOrigin(props.data) === getNormalizedOrigin(props.original),
            (t, props) => ({
                direct: () => ({
                    message: t('shouldBeSame', {
                        data: hideUndefined(props.data),
                        original: hideUndefined(props.original)
                    })
                }),
                opposite: () => ({
                    message: t('shouldNotBeSame', {
                        data: hideUndefined(props.data),
                        original: hideUndefined(props.original)
                    })
                })
            })
        )
    };
};

export { translations };
