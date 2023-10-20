import { ConditionResult } from '@toloka-tb/core/api/helpers/condition';
import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/condition.any.translations';

export type ConditionAnyProps = {
    conditions: ConditionResult[];
};

const type = 'condition.any';

// maybe use FormatList here

export const create = (core: Core) => {
    const { hasConditionPassed, getConditionError } = core.conditionUtils;

    return {
        type,
        compile: core.helpers.conditionV2<ConditionAnyProps, keyof typeof translations.ru>(
            type,
            (props) => props.conditions.some(hasConditionPassed),
            (t, props) => ({
                direct: () => {
                    const children = props.conditions
                        .filter((condition) => !hasConditionPassed(condition))
                        .map((condition) => getConditionError(condition, 'direct'));

                    return { message: '', childrenSeparatePrefix: `${t('or')} `, children };
                },
                opposite: () => {
                    const children = props.conditions
                        .filter((condition) => hasConditionPassed(condition))
                        .map((condition) => getConditionError(condition, 'opposite'));

                    return { message: '', childrenSeparatePrefix: `${t('or')} `, children };
                }
            })
        )
    };
};

export { translations };
