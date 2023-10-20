import { ValidationError } from '../ctx/form';
import { ConditionResult, ErrorResolvingDirection } from './helpers/condition';

export const hideUndefined = (str: unknown) => (typeof str === 'undefined' ? '' : String(str));
export const hasConditionPassed = (conditionResult: ConditionResult) => {
    if (typeof conditionResult === 'undefined') {
        return true;
    }

    if (typeof conditionResult === 'boolean') {
        return conditionResult;
    }

    if (typeof conditionResult === 'object' && typeof conditionResult.passed === 'boolean') {
        return conditionResult.passed;
    }

    return false;
};

export const getConditionError = (condition: ConditionResult, direction: ErrorResolvingDirection): ValidationError => {
    if (typeof condition === 'object') {
        return condition.errorGetter[direction]();
    }

    /* eslint-disable no-console */
    console.info(condition);
    console.error(
        `Validation error generating failed, expected condition to be passed to validation field, but got ${typeof condition}. See full object in console above`
    );
    /* eslint-enable no-console */

    return {
        message: `Validation error generating failed, expected condition to be passed to validation field, but got ${typeof condition}`
    };
};
