import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.empty.translations';

export type ConditionEmptyProps = {
    data: any;
};

const type = 'condition.empty';

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.conditionV2<ConditionEmptyProps, keyof typeof translations.ru>(
            type,
            (props) => {
                if (typeof props.data === 'undefined' || props.data === null) return true;

                if (typeof props.data === 'string' && props.data === '') return true;

                if (Array.isArray(props.data) && props.data.length === 0) return true;
                if (typeof props.data === 'object' && Object.keys(props.data).length === 0) return true;

                return false;
            },
            (t) => ({
                direct: () => ({ message: t('empty') }),
                opposite: () => ({ message: t('notEmpty') })
            })
        )
    };
};

export { translations };
