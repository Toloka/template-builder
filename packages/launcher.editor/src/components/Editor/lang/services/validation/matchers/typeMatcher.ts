import { frontendIdm, typeHandlers } from '../../../typeHandlers/typeHandlers';
import { excludeHiddenTypes, getPossibleTypes } from '../../../utils/getPossibleTypes';
import { workerI18n } from '../../workerI18n';
import { Matcher } from '../validationTypes';
import { validateObject } from './schemaMatcher';

export const typeMatcher: Matcher = (expectations, { componentPath }) => {
    // if object has type property it is fine (will check type later)
    if (expectations.expectedType === 'value' && componentPath.tail.type === 'object') {
        for (const prop of componentPath.tail.props) {
            if (prop.key.type === 'key' && prop.key.value === 'type' && prop.value.type === 'string') {
                if (expectations.isExpected(['string-static'])) {
                    return false;
                }

                const handler = typeHandlers[prop.value.value];

                // type will get angry anyway
                if (!handler) return { valid: true };

                return validateObject(componentPath.tail, handler.schema, componentPath);
            }
        }
    }

    // check if type meets expectations
    if (expectations.expectedType === 'type') {
        if (componentPath.tail.type !== 'string') {
            return {
                valid: false,
                message: {
                    text: workerI18n.t('validation.nonStringType'),
                    priority: 50
                },
                skip: 'this object'
            };
        }

        const types = getPossibleTypes(expectations, componentPath);

        if (types.includes(componentPath.tail.value)) {
            return {
                valid: true
            };
        } else {
            return {
                valid: false,
                message: {
                    text: workerI18n.t('validation.unsuitableType', {
                        types: excludeHiddenTypes(types, frontendIdm.current).join('\n')
                    }),
                    priority: 50
                },
                skip: 'this object'
            };
        }
    }

    return false;
};
