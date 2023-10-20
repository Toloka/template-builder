import { TbJSONSchema, TbJSONSchemaDefinition } from '@toloka-tb/component2schema';

import { mergeAllOf, mergeAnyOf, mergeOneOf } from './branchMergeForTolokaSpec';
import { ValidationIssue } from './getValidation';
import { TolokaDataProperty, TolokaDataSpec } from './TolokaTyping';

const getNumProps = (value: TbJSONSchema) => {
    return {
        max_value: value.maximum,
        min_value: value.minimum,
        allowed_values: value.enum as number[],
        required: false
    };
};

const mapItem = (value: TbJSONSchemaDefinition): TolokaDataProperty => {
    if (typeof value !== 'object') {
        return {
            type: 'json'
        };
    }

    switch (value.tbSpecialType) {
        case 'coordinates': {
            return {
                type: 'coordinates',
                current_location: false
            };
        }
        case 'currentLocation': {
            return {
                type: 'coordinates',
                current_location: true
            };
        }
        case 'file': {
            return {
                type: 'file'
            };
        }
        case 'url': {
            return {
                type: 'url'
            };
        }
        case 'maybeInteger': {
            return {
                type: 'integer',
                ...getNumProps(value)
            };
        }
        case 'maybeCoordinates': {
            return {
                type: 'coordinates',
                current_location: false
            };
        }
    }

    switch (value.type) {
        case 'object': {
            return {
                type: 'json'
            };
        }
        case 'boolean': {
            return {
                type: 'boolean'
            };
        }
        case 'integer': {
            return {
                type: 'integer',
                ...getNumProps(value)
            };
        }
        case 'number': {
            return {
                type: 'float',
                ...getNumProps(value)
            };
        }
        case 'string': {
            return {
                type: 'string',
                min_length: value.minLength,
                max_length: value.maxLength,
                allowed_values: value.enum as string[]
            };
        }
        case 'array': {
            const itemSchema = value.items;

            if (typeof itemSchema !== 'object' || Array.isArray(itemSchema)) {
                return {
                    type: 'array_json'
                };
            }

            const child = mapItem(itemSchema);

            return {
                ...child,
                type: `array_${child.type}` as any,
                max_size: value.maxItems,
                min_size: value.minItems
            } as TolokaDataProperty;
        }
    }

    if (value.allOf) {
        return mapItem(mergeAllOf(value.allOf));
    }
    if (value.anyOf) {
        return mapItem(mergeAnyOf(value.anyOf));
    }
    if (value.oneOf) {
        return mapItem(mergeOneOf(value.oneOf));
    }

    if (value.not !== undefined) {
        return {
            type: 'json'
        };
    }

    // eslint-disable-next-line no-throw-literal
    throw { key: 'tolokaSpecGen.unknownType', params: { schema: JSON.stringify(value) } };
};

export const schema2tolokaDataSpec = (
    validation: TbJSONSchemaDefinition | undefined,
    dataType: 'input' | 'output' = 'output'
): { spec: TolokaDataSpec; issues: ValidationIssue[] } => {
    if (typeof validation !== 'object') {
        return {
            spec: {},
            issues: [
                { key: dataType === 'input' ? 'tolokaSpecGen.dataInputRequired' : 'tolokaSpecGen.dataOutputRequired' }
            ]
        };
    }

    const tolokaDataSpec: TolokaDataSpec = {};

    const schema = (validation as any) as TbJSONSchema;

    if (schema.anyOf || schema.oneOf || schema.allOf) {
        const branches = (schema.anyOf || schema.oneOf || schema.allOf)!.map((variant) => {
            const branch = schema2tolokaDataSpec(variant, dataType);

            Object.keys(branch.spec).forEach((key) => {
                branch.spec[key].required = false;
            });

            return branch;
        });

        return branches.reduce(
            (acc, branch) => ({ spec: { ...acc.spec, ...branch.spec }, issues: [...acc.issues, ...branch.issues] }),
            {
                spec: {},
                issues: []
            }
        );
    }

    if (schema.type !== 'object' && !schema.properties && !schema.anyOf && !schema.oneOf) {
        return {
            spec: {},
            issues: [
                { key: dataType === 'input' ? 'tolokaSpecGen.dataInputRequired' : 'tolokaSpecGen.dataOutputRequired' }
            ]
        };
    }

    if (Object.keys(schema.properties || {}).length === 0) {
        return {
            spec: {},
            issues: [
                { key: dataType === 'input' ? 'tolokaSpecGen.dataInputRequired' : 'tolokaSpecGen.dataOutputRequired' }
            ]
        };
    }

    const issues: ValidationIssue[] = [];

    Object.entries(schema.properties!).forEach(([key, value]) => {
        try {
            const mappedItem = mapItem(value);

            tolokaDataSpec[key] = mappedItem;
            if ((schema.required || []).includes(key)) {
                tolokaDataSpec[key].required = true;
            } else {
                tolokaDataSpec[key].required = false;
            }
        } catch (err) {
            tolokaDataSpec[key] = { type: 'json', required: false };
            if (err.key) {
                issues.push(err);
            }
        }
    });

    if (schema.required) {
        schema.required.forEach((key) => (tolokaDataSpec[key].required = true));
    }

    return {
        spec: tolokaDataSpec,
        issues
    };
};
