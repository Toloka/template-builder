import { ConditionCommonProps, ConditionResult } from '@toloka-tb/core/api/helpers/condition';
import { JSONSchema7 } from 'json-schema';

export type TbJSONSchema = JSONSchema7 & {
    tbSpecialType?: 'url' | 'file' | 'coordinates' | 'currentLocation' | 'maybeInteger' | 'maybeCoordinates';
    patternHint?: string;
};
export type TbJSONSchemaDefinition = boolean | TbJSONSchema;

export const alwaysPassSchema = {
    whatIsIt:
        'A special template builder object that is used during schema generation. After all transformations it must be replaced with "true" or "false" depending on the json schema context. If you see that text in JSON Schema output – report the template builder developers',
    __tbId: 'template builder always pass schema'
} as TbJSONSchemaDefinition;

export const isAlwaysPassSchema = (toCheck: any) =>
    typeof toCheck === 'object' && toCheck !== null && toCheck.__tbId === 'template builder always pass schema';

export const isGettable = (toCheck: any) =>
    typeof toCheck === 'object' && toCheck !== null && typeof toCheck.type === 'string';

export type Condition2Schema<P = {}> = (
    props: P & ConditionCommonProps,
    transformChild: (child: ConditionResult) => TransformedConditionSchema
) => TransformedConditionSchema;

export type TransformedConditionSchema = {
    schema: object | boolean;
    required: boolean;
    invertRequired?: true;
};

export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null';
export const getPrimitive = (value: any): PrimitiveType | undefined => {
    if (isGettable(value)) {
        return undefined;
    }

    const type = typeof value;

    if (value === null) {
        return 'null';
    }
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return type;
    }

    return undefined;
};

export const primitiveValuesArrayToSchema = (values: any[] = []) => {
    const typesMap: { [type: string]: true } = {};
    const valueEnum: { [type: string]: PrimitiveType[] } = {};

    if (values && Array.isArray(values) && values.every((value: any) => getPrimitive(value))) {
        values.forEach((value: any) => {
            const type = getPrimitive(value)!;

            typesMap[type] = true;
            if (valueEnum[type]) {
                valueEnum[type].push(value);
            } else {
                valueEnum[type] = [value];
            }
        });
    }

    const types = Object.keys(typesMap);

    if (types.length === 0) {
        return alwaysPassSchema;
    } else if (types.length === 1) {
        const type = types[0];

        return {
            type,
            enum: Array.from(new Set(valueEnum[type]))
        };
    } else {
        return {
            anyOf: types.map((type) => ({
                type,
                enum: Array.from(new Set(valueEnum[type]))
            }))
        };
    }
};
