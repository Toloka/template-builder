import { workerI18n } from '../../workerI18n';
import { Matcher } from '../validationTypes';

export const $refMatcher: Matcher = (expectations, { componentPath }) => {
    if (componentPath.type !== '$ref') return false;

    if (componentPath.path.length === 0 && componentPath.tail.type === 'object') {
        return { valid: true };
    }

    if (
        expectations.expectedType === 'value' &&
        componentPath.path[0] === '$ref' &&
        componentPath.tail.type === 'string'
    ) {
        return { valid: true };
    }

    if (expectations.expectedType === 'key' && componentPath.tail.type === 'key') {
        if (componentPath.tail.value === '$ref') {
            return { valid: true };
        } else {
            return {
                valid: false,
                message: {
                    text: workerI18n.t('validation.$refProperties'),
                    priority: 1000
                }
            };
        }
    }

    return false;
};
