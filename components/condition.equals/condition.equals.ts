import { Core } from '@toloka-tb/core/coreComponentApi';
import isEqual from 'react-fast-compare';

import translations from './i18n/condition.equals.translations';

export type ConditionEqualsProps = {
    data: any;
    to: any;
};

const type = 'condition.equals';

export const create = (core: Core) => {
    const { hideUndefined } = core.conditionUtils;

    return {
        type,
        compile: core.helpers.conditionV2<ConditionEqualsProps, keyof typeof translations.ru>(
            type,
            (props) => isEqual(props.data, props.to),
            (t, props) => ({
                direct: () => ({
                    message: t('shouldBeEqual', { data: hideUndefined(props.data), to: JSON.stringify(props.to) })
                }),
                opposite: () => ({
                    message: t('shouldNotBeEqual', { data: hideUndefined(props.data), to: JSON.stringify(props.to) })
                })
            })
        )
    };
};

export { translations };
