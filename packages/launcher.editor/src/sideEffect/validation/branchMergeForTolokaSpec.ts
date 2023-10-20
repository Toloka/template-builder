/* eslint-disable no-use-before-define */
import { TbJSONSchema, TbJSONSchemaDefinition } from '@toloka-tb/component2schema';
import merge from 'deepmerge';

const intersection = (arrays: unknown[][]) => {
    const countMap: { [key: string]: number } = {};
    const realValueMap: { [key: string]: unknown } = {};
    const result: unknown[] = [];

    for (const array of arrays) {
        for (const item of array) {
            if (typeof item === 'object') {
                result.push(item);
            } else if (countMap[String(item)]) {
                countMap[String(item)]++;
            } else {
                countMap[String(item)] = 1;
                realValueMap[String(item)] = item;
            }
        }
    }

    result.push(
        ...Object.keys(countMap)
            .filter((field) => countMap[field] === arrays.length)
            .map((field) => realValueMap[field])
    );

    return result;
};

const flatOptions = (options: TbJSONSchemaDefinition[]): TbJSONSchemaDefinition[] => {
    const totalOptions: TbJSONSchemaDefinition[] = [];

    for (const option of options) {
        if (typeof option === 'object') {
            if ('allOf' in option) {
                totalOptions.push(mergeAllOf(option.allOf || []));
            } else if ('anyOf' in option) {
                totalOptions.push(mergeAnyOf(option.anyOf || []));
            } else if ('oneOf' in option) {
                totalOptions.push(mergeOneOf(option.oneOf || []));
            } else {
                totalOptions.push(option);
            }
        }
    }

    return totalOptions;
};

const allPropreties: {
    [field: string]: (values: any[]) => any;
} = {
    enum: (values: unknown[][]) => intersection(values),
    maximum: (values: number[]) => Math.min(...values),
    exclusiveMaximum: (values: number[]) => Math.min(...values),
    minimum: (values: number[]) => Math.max(...values),
    exclusiveMinimum: (values: number[]) => Math.max(...values),
    maxLength: (values: number[]) => Math.min(...values),
    minLength: (values: number[]) => Math.max(...values),
    maxItems: (values: number[]) => Math.min(...values),
    minItems: (values: number[]) => Math.max(...values),
    maxProperties: (values: number[]) => Math.min(...values),
    minProperties: (values: number[]) => Math.max(...values),
    additionalProperties: (values: boolean[]) => values.every(Boolean),
    tbSpecialType: (values: unknown[]) => (values.every((value) => value === values[0]) ? values[0] : undefined)
};

export const mergeAllOf = (options: TbJSONSchemaDefinition[]): TbJSONSchemaDefinition => {
    const totalOptions: TbJSONSchemaDefinition[] = flatOptions(options);

    if (totalOptions.length === 0) return true;
    if (totalOptions.some((option) => typeof option !== 'object')) return true;

    const properties: { [key: string]: unknown[] } = {};

    for (const option of totalOptions as TbJSONSchema[]) {
        for (const property in option) {
            if (property !== 'type' && !(property in anyPropreties)) return true;

            const propertyValue = option[property as keyof typeof option];

            if (typeof propertyValue !== 'undefined')
                properties[property] = properties[property]
                    ? [...properties[property], propertyValue]
                    : [propertyValue];
        }
    }

    if (properties.type && properties.type.some((type) => type !== properties.type[0])) return true;

    const result: TbJSONSchema = {
        type: properties.type[0] as TbJSONSchema['type']
    };

    for (const property in properties) {
        if (property !== 'type')
            (result[property as keyof typeof result] as any) = allPropreties[property](properties[property]);
    }

    return result;
};

const anyPropreties: {
    [field: string]: (values: any[]) => any;
} = {
    enum: (values: unknown[][]) => [...new Set(merge.all(values) as unknown[])],
    maximum: (values: number[]) => Math.max(...values),
    exclusiveMaximum: (values: number[]) => Math.max(...values),
    minimum: (values: number[]) => Math.min(...values),
    exclusiveMinimum: (values: number[]) => Math.min(...values),
    maxLength: (values: number[]) => Math.max(...values),
    minLength: (values: number[]) => Math.min(...values),
    maxItems: (values: number[]) => Math.max(...values),
    minItems: (values: number[]) => Math.min(...values),
    maxProperties: (values: number[]) => Math.max(...values),
    minProperties: (values: number[]) => Math.min(...values),
    additionalProperties: (values: boolean[]) => values.some(Boolean),
    tbSpecialType: (values: unknown[]) => (values.every((value) => value === values[0]) ? values[0] : undefined),
    items: (values: TbJSONSchemaDefinition[]) => mergeAnyOf(values)
};

export const mergeAnyOf = (options: TbJSONSchemaDefinition[]): TbJSONSchemaDefinition => {
    const totalOptions: TbJSONSchemaDefinition[] = flatOptions(options);

    if (totalOptions.length === 0) return true;
    if (totalOptions.some((option) => typeof option !== 'object')) return true;

    const properties: { [key: string]: unknown[] } = {};

    for (const option of totalOptions as TbJSONSchema[]) {
        for (const property in option) {
            if (property !== 'type' && !(property in anyPropreties)) return true;

            const propertyValue = option[property as keyof typeof option];

            if (typeof propertyValue !== 'undefined')
                properties[property] = properties[property]
                    ? [...properties[property], propertyValue]
                    : [propertyValue];
        }
    }

    if (properties.type && properties.type.some((type) => type !== properties.type[0])) return true;

    const result: TbJSONSchema = {
        type: properties.type[0] as TbJSONSchema['type']
    };

    for (const property in properties) {
        if (property !== 'type')
            (result[property as keyof typeof result] as any) = anyPropreties[property](properties[property]);
    }

    return result;
};

export const mergeOneOf = (options: TbJSONSchemaDefinition[]) => options[0] || true;
