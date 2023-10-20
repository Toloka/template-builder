import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.link-opened.translations';

export type ConditionLinkOpenedProps = {
    url: string;
};

const type = 'condition.link-opened';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.conditionV2<ConditionLinkOpenedProps, keyof typeof translations.ru>(
            type,
            (props, ctxBag) => Boolean(ctxBag && core.externalLinks.wasOpened(ctxBag, props.url)),
            (t) => ({
                direct: () => ({ message: t('follow') }),
                opposite: () => ({ message: t('shouldNotFollow') })
            })
        )
    };
};

export { translations };
