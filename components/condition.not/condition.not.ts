import { ConditionResult } from '@toloka-tb/core/api/helpers/condition';
import { Core } from '@toloka-tb/core/coreComponentApi';

export type ConditionNotProps = {
    condition: ConditionResult;
};

const type = 'condition.not';

export const create = (core: Core) => {
    const { hasConditionPassed, getConditionError } = core.conditionUtils;

    return {
        type,
        compile: core.helpers.conditionV2<ConditionNotProps, never>(
            type,
            (props) => !hasConditionPassed(props.condition),
            (_, props) => ({
                direct: () => getConditionError(props.condition, 'opposite'),
                opposite: () => getConditionError(props.condition, 'direct')
            })
        )
    };
};
