import { ConditionResult } from '@toloka-tb/core/api/helpers/condition';
import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.all.translations';

export type ConditionAllProps = {
    conditions: ConditionResult[];
};

const type = 'condition.all';

// maybe use FormatList here

export const create = (core: Core) => {
    const { hasConditionPassed, getConditionError } = core.conditionUtils;

    return {
        type,
        compile: core.helpers.conditionV2<ConditionAllProps, keyof typeof translations.ru>(
            type,
            (props) => props.conditions.every(hasConditionPassed),
            (t, props) => ({
                direct: () => {
                    const children = props.conditions
                        .filter((condition) => !hasConditionPassed(condition))
                        .map((condition) => getConditionError(condition, 'direct'));

                    return { message: '', childrenSeparatePrefix: `${t('and')} `, children };
                },
                opposite: () => {
                    const children = props.conditions
                        .filter((condition) => hasConditionPassed(condition))
                        .map((condition) => getConditionError(condition, 'opposite'));

                    return { message: '', childrenSeparatePrefix: `${t('and')} `, children };
                }
            })
        )
    };
};

export { translations };
