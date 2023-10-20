import { workerI18n } from '../../workerI18n';
import { Matcher } from '../validationTypes';

export const $emptyMatcher: Matcher = (expectations, { componentPath }) => {
    if (componentPath.type !== '$empty') return false;

    if (componentPath.path.length === 0 && componentPath.tail.type === 'object') {
        return { valid: true };
    }

    if (
        expectations.expectedType === 'value' &&
        componentPath.path[0] === '$empty' &&
        componentPath.tail.type === 'boolean'
    ) {
        return { valid: true };
    }

    if (expectations.expectedType === 'key' && componentPath.tail.type === 'key') {
        if (componentPath.tail.value === '$empty') {
            return { valid: true };
        } else {
            return {
                valid: false,
                message: {
                    text: workerI18n.t('validation.$emptyProperties'),
                    priority: 1000
                }
            };
        }
    }

    return false;
};
