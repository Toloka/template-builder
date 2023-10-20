import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.required.translations';

export type ConditionRequiredProps = {
    data: any;
};

const type = 'condition.required';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.conditionV2<ConditionRequiredProps, keyof typeof translations.ru>(
            type,
            (props) => typeof props.data !== 'undefined',
            (t) => ({
                direct: () => ({ message: t('required') }),
                opposite: () => ({ message: t('antiRequired') })
            })
        )
    };
};

export { translations };
