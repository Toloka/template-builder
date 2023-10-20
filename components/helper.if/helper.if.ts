import { ConditionResult, Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.if';

export type HelperIfProps = {
    condition: ConditionResult;
    then: any;
    else?: any;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperIfProps, string>(({ condition, then, else: elseValue }) =>
            core.conditionUtils.hasConditionPassed(condition) ? then : elseValue
        )
    };
};
