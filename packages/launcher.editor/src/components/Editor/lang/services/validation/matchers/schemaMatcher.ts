/* eslint-disable max-depth */
import { TbJSONSchema } from '@toloka-tb/component2schema';
import { ObjectNode } from '@toloka-tb/lang.json';
import { JSONSchema7 } from 'json-schema';

import { ComponentPath } from '../../../ast/astUtils';
import { typeHandlers } from '../../../typeHandlers/typeHandlers';
import { extendRequiredConditionProps } from '../../../utils/conditionExtenders';
import { workerI18n } from '../../workerI18n';
import { Match, Matcher } from '../validationTypes';

export const validateObject = (object: ObjectNode, originalSchema: JSONSchema7, componentPath: ComponentPath) => {
    const schema = extendRequiredConditionProps(originalSchema, componentPath);

    if (schema.minProperties && object.props.length < schema.minProperties) {
        return {
            valid: false,
            message: {
                text: workerI18n.t('validation.minProperties', { min: schema.minProperties }),
                priority: 10,
                range: {
                    form: object.from,
                    to: object.to
                }
            }
        };
    }

    if (!schema.required) return { valid: true };

    const existingKeys = object.props
        .map((prop) => (prop.key.type === 'missing' ? '' : prop.key.value))
        .filter(Boolean);

    const missingKeys = schema.required.filter((key) => !existingKeys.includes(key));

    if (missingKeys.length === 0) {
        return { valid: true };
    } else {
        const lastProp = object.props[object.props.length - 1];

        return {
            valid: false,
            message: {
                text: workerI18n.t('validation.missingKeys', { properties: missingKeys.join(', ') }),
                priority: 10,
                range: {
                    form: lastProp ? lastProp.to + 2 : object.from + 1,
                    to: object.to
                }
            }
        };
    }
};

const isExpectedKey = (schema: JSONSchema7, componentPath: ComponentPath) => {
    if (componentPath.tail.type !== 'key') return false;

    const suggestedKeys = schema.properties ? Object.keys(schema.properties) : [];

    if (schema.additionalProperties) {
        return { valid: true } as const;
    }

    if (suggestedKeys.includes(componentPath.tail.value)) {
        return { valid: true } as const;
    } else {
        const path = `${componentPath.type}.${componentPath.path.slice(0, -1).join('.')}`;

        return {
            valid: false,
            message: {
                priority: 10,
                text: workerI18n.t('validation.unknownProperty', {
                    type: path,
                    properties: suggestedKeys.join(', ')
                })
            },
            skip: 'subtree'
        } as const;
    }
};

const hasDuplicate = (object: ObjectNode, key: string) => {
    let count = 0;

    object.props.forEach((prop) => {
        if (prop.key.type === 'key' && prop.key.value === key) {
            ++count;
        }
    });

    return count > 1;
};

const handleKey = (componentPath: ComponentPath): Match => {
    if (componentPath.tail.type !== 'key') return false;

    // handle key matching
    const handler = typeHandlers[componentPath.type];

    if (!handler) return false;

    const keyOwnerSchemas = handler.getSchemaByPath(componentPath.path.slice(0, -1));
    const possibleSchemas = keyOwnerSchemas.filter((schema) => schema !== false) as JSONSchema7[];

    if (possibleSchemas.some((schema) => schema === true)) return { valid: true };
    if (possibleSchemas.length === 0) return false;

    let invalidResult: Match = false;

    for (const schema of possibleSchemas) {
        const isExpected = isExpectedKey(schema, componentPath);

        if (!isExpected || !isExpected.valid) {
            invalidResult = isExpected;
        } else {
            if (!hasDuplicate(componentPath.tail.owner, componentPath.tail.value)) {
                return { valid: true };
            } else {
                invalidResult = {
                    valid: false,
                    message: {
                        priority: 10,
                        text: workerI18n.t('validation.keyDuplicate')
                    }
                };
            }
        }
    }

    return invalidResult;
};

export const schemaMatcher: Matcher = (expectation, { schemas, componentPath }): Match => {
    // handle key matching
    if (expectation.expectedType === 'key' && componentPath.tail.type === 'key') {
        return handleKey(componentPath);
    }

    // handle value matching
    const possibleSchemas = schemas.filter((schema) => schema !== false) as TbJSONSchema[];

    if (possibleSchemas.some((schema) => schema === true)) return { valid: true };
    if (possibleSchemas.length === 0) return false;

    if (expectation.expectedType === 'value' && componentPath.tail.type !== 'missing') {
        // TODO: see if need this hack at all (like this is a weird way to say any)
        if (expectation.isExpected(['data'])) {
            return { valid: true };
        }

        if (
            componentPath.tail.type === 'array' ||
            componentPath.tail.type === 'object' ||
            componentPath.tail.type === 'null'
        ) {
            let invalidResult: Match = false;

            for (const schema of possibleSchemas) {
                if (typeof schema !== 'boolean' && schema.type === componentPath.tail.type) {
                    if (componentPath.tail.type === 'object' && (schema.required || schema.minProperties)) {
                        const ensureResult = validateObject(componentPath.tail, schema, componentPath);

                        if (ensureResult.valid) {
                            return ensureResult;
                        } else {
                            invalidResult = ensureResult;
                        }
                    } else if (
                        componentPath.tail.type === 'array' &&
                        schema.minItems &&
                        componentPath.tail.items.length < schema.minItems
                    ) {
                        return {
                            valid: false,
                            message: {
                                text: workerI18n.t('validation.minItems', { min: schema.minItems }),
                                priority: 10,
                                range: {
                                    form: componentPath.tail.from,
                                    to: componentPath.tail.to
                                }
                            }
                        };
                    } else {
                        return { valid: true };
                    }
                }
            }

            return invalidResult;
        }

        let invalidResult: Match = false;

        for (const schema of possibleSchemas) {
            if (schema.enum) {
                if (schema.enum.includes(componentPath.tail.value)) {
                    return {
                        valid: true
                    };
                } else {
                    invalidResult = {
                        valid: false,
                        message: {
                            text: workerI18n.t('validation.enum', { enum: schema.enum.join(', ') }),
                            priority: 10
                        }
                    };
                }
            } else if ('const' in schema) {
                if (schema.const === componentPath.tail.value) {
                    return {
                        valid: true
                    };
                } else {
                    invalidResult = {
                        valid: false,
                        message: {
                            text: workerI18n.t('validation.const', { const: schema.const }),
                            priority: 10
                        }
                    };
                }
            } else if (schema.type === 'string' && schema.pattern && componentPath.tail.type === 'string') {
                if (!new RegExp(schema.pattern).test(componentPath.tail.value)) {
                    invalidResult = {
                        valid: false,
                        message: {
                            text:
                                schema.patternHint ||
                                workerI18n.t('validation.pattern', {
                                    pattern: schema.pattern,
                                    value: componentPath.tail.value
                                }),
                            priority: 10
                        }
                    };
                }
            }
        }

        if (invalidResult) {
            return invalidResult;
        }

        if (
            expectation.isExpected([componentPath.tail.type]) ||
            (componentPath.tail.type === 'string' && expectation.isExpected(['string-static']))
        ) {
            return { valid: true };
        }

        if (expectation.isExpected(['integer']) && componentPath.tail.type === 'number') {
            if (Number.isInteger(componentPath.tail.value)) {
                return { valid: true };
            }
        }

        return invalidResult;
    }

    return false;
};
