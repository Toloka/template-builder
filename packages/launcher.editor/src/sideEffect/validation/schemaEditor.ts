import { flatten } from '@toloka-tb/common/utils/flatten';
import { isAlwaysPassSchema, TbJSONSchema, TbJSONSchemaDefinition } from '@toloka-tb/component2schema';
import { ErrorResolvingDirection } from '@toloka-tb/core/api/helpers/condition';

import { getArchetype } from '../../components/Editor/lang/utils/getArchetype';
import { transformCondition } from './conditionTransformer';
import { ConditionConfig, DataConfig } from './getValidation';

const branches = ['allOf', 'anyOf', 'oneOf'];
const processSchemaBranches = <R = void>(obj: any, branchProcessor: (branch: any) => R): R[] => {
    const result: R[] = [];

    if (branches.some((branch) => obj[branch])) {
        for (const branchName of branches) {
            if (obj[branchName]) {
                for (const branch of obj[branchName]) {
                    result.push(branchProcessor(branch));
                }
            }
        }
    }

    return result;
};

type JSONSchemaObjectProperties = { [propertyName: string]: TbJSONSchema };
type JSONSchemaArray = TbJSONSchema & { items: TbJSONSchema };
const processSchemaChild = <R = void>(
    obj: TbJSONSchema,
    key: string,
    processArray: (array: JSONSchemaArray) => R,
    processObject: (objectProperties: JSONSchemaObjectProperties, propertyName: string) => R
) => {
    if (typeof obj !== 'object') {
        throw new Error(`Unable to process non-object schema`);
    }
    const isArray = /^\d+$/.test(key);

    if (obj.anyOf !== undefined) {
        const branchedObj = { type: isArray ? ('array' as const) : ('object' as const) };

        obj.anyOf.push(branchedObj);
        // eslint-disable-next-line no-param-reassign
        obj = branchedObj;
    }

    if (isArray) {
        obj.type = 'array';
        if (obj.items === undefined) obj.items = {};

        return processArray(obj as JSONSchemaArray);
    } else {
        obj.type = 'object';
        if (obj.additionalProperties === undefined) obj.additionalProperties = false;
        if (obj.properties === undefined) obj.properties = {};
        if (obj.properties[key] === undefined) obj.properties[key] = true;

        return processObject(obj.properties as JSONSchemaObjectProperties, key);
    }
};

export const insertToSchema = (obj: any, path: string, val: any) => {
    const parts = path.split('.');

    const key = parts[0];
    const lastIteration = parts.length === 1;

    processSchemaBranches(obj, (branch) => insertToSchema(branch, path, val));

    processSchemaChild(
        obj,
        key,
        (array) => {
            if (lastIteration) {
                array.items = val;
            } else {
                insertToSchema(array.items, parts.slice(1).join('.'), val);
            }
        },
        (properties, propertyName) => {
            if (lastIteration) {
                properties[propertyName] = val;
            } else {
                if (typeof properties[key] !== 'object') {
                    properties[key] = { type: 'object' };
                }
                insertToSchema(properties[key], parts.slice(1).join('.'), val);
            }
        }
    );
};

export const allowAdditionalProperties = (schema: any) => {
    if (schema.additionalProperties === false) {
        schema.additionalProperties = true;
    }

    processSchemaBranches(schema, (branch) => allowAdditionalProperties(branch));
    if (schema.type === 'array' && schema.items) {
        allowAdditionalProperties(schema.items);
    } else if (schema.type === 'object' && schema.properties) {
        Object.keys(schema.properties).forEach((property) => allowAdditionalProperties(schema.properties[property]));
    }
};

export const verifyStaticPath = (config: object, path: string): boolean => {
    const parts = path.split('.');
    const part = parts[0];

    if (!config || part === '' || part === undefined) {
        return true;
    }

    if (
        part !== 'validation' &&
        'type' in config &&
        typeof (config as any).type === 'string' &&
        (getArchetype((config as any).type) === 'field' || getArchetype((config as any).type) === 'helper')
    ) {
        return false;
    }

    return verifyStaticPath((config as any)[part], parts.slice(1).join('.'));
};

type IsChildRequired = boolean;
export const addVariationToSchema = ({
    schemaToBeExtended,
    dataPath,
    condition,
    dataMayBeRequired,
    fallbackData
}: {
    schemaToBeExtended: TbJSONSchema;
    dataPath: string;
    condition: ConditionConfig;
    dataMayBeRequired: boolean;
    fallbackData?: DataConfig;
}): IsChildRequired => {
    const parts = dataPath.split('.');
    const key = parts[0];
    const lastIteration = parts.length === 1;

    if (lastIteration) {
        return processSchemaChild(
            schemaToBeExtended,
            key,
            (array) => {
                const { schema, required } = transformCondition(condition, fallbackData);

                if (array.items === true) {
                    array.items = schema;
                } else if (schema !== true) {
                    if (array.items.anyOf === undefined) {
                        array.items = { anyOf: [array.items] as TbJSONSchemaDefinition[] };
                    }
                    array.items.anyOf!.push(schema);
                    if (required && dataMayBeRequired) {
                        array.items.anyOf!.push({
                            minItems: 1
                        });
                    }
                }

                return required;
            },
            (properties, propertyName) => {
                const { schema, required } = transformCondition(condition, fallbackData);

                if (properties[propertyName] === true) {
                    properties[propertyName] = schema as TbJSONSchema;
                } else if (schema !== true) {
                    if (properties[propertyName].anyOf === undefined) {
                        properties[propertyName] = { anyOf: [properties[propertyName]] };
                    }
                    properties[propertyName].anyOf!.push(schema);
                }
                if (
                    required &&
                    dataMayBeRequired &&
                    (!schemaToBeExtended.required || !schemaToBeExtended.required.includes(propertyName))
                ) {
                    if (schemaToBeExtended.required === undefined) {
                        schemaToBeExtended.required = [];
                    }
                    schemaToBeExtended.required.push(propertyName);
                }

                return required;
            }
        );
    }

    let branchesRequired = false;

    const branchesProcessingResult = processSchemaBranches<boolean>(schemaToBeExtended, (branch) =>
        addVariationToSchema({ schemaToBeExtended: branch, dataPath, condition, dataMayBeRequired, fallbackData })
    );

    if (branchesProcessingResult.length > 0) {
        const someBranchIsRequired = flatten(branchesProcessingResult).some(Boolean);

        if (someBranchIsRequired) {
            branchesRequired = true;
        }
    }

    return processSchemaChild(
        schemaToBeExtended,
        key,
        (array) => {
            const required = addVariationToSchema({
                schemaToBeExtended: array.items,
                dataPath: parts.slice(1).join('.'),
                condition,
                dataMayBeRequired,
                fallbackData
            });

            if (required && dataMayBeRequired) {
                if (array.minItems === undefined) {
                    array.minItems = 1;
                }
            }

            return dataMayBeRequired && (required || branchesRequired);
        },
        (properties, propertyName) => {
            const required = addVariationToSchema({
                schemaToBeExtended: properties[propertyName],
                dataPath: parts.slice(1).join('.'),
                condition,
                dataMayBeRequired,
                fallbackData
            });

            if (required && dataMayBeRequired) {
                if (schemaToBeExtended.required === undefined) {
                    schemaToBeExtended.required = [];
                }
                if (!schemaToBeExtended.required.includes(propertyName)) {
                    schemaToBeExtended.required.push(propertyName);
                }
            }

            return dataMayBeRequired && (required || branchesRequired);
        }
    );
};

export const replaceAlwaysPassSchema = (schema: TbJSONSchema, direction: ErrorResolvingDirection = 'direct') => {
    if (typeof schema !== 'object') return;
    for (const key in schema) {
        if (isAlwaysPassSchema((schema as any)[key])) {
            if (key === 'not') {
                (schema as any)[key] = direction === 'opposite';
            } else {
                (schema as any)[key] = direction === 'direct';
            }
        }
        if (key === 'not') {
            replaceAlwaysPassSchema((schema as any)[key], direction === 'direct' ? 'opposite' : 'direct');
        } else {
            replaceAlwaysPassSchema((schema as any)[key], direction);
        }
    }
};
