import { ConditionResult, Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.switch';

export type HelperSwitchProps = {
    cases: Array<{
        condition: ConditionResult;
        result: any;
    }>;
    default: any;
};
export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperSwitchProps, string>(
            ({ cases, default: defaultValue }: HelperSwitchProps) => {
                for (const caseContainer of cases) {
                    if (core.conditionUtils.hasConditionPassed(caseContainer.condition)) {
                        return caseContainer.result;
                    }
                }

                return defaultValue;
            }
        )
    };
};
