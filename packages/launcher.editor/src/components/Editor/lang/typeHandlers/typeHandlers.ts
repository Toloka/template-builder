import { JSONSchema7, JSONSchema7Array, JSONSchema7Definition } from 'json-schema';

import { componentTranslateSchema } from '../../../../i18n/componentsI18n';
import { TbState } from '../../../../store/tbStore';
import { Path } from '../ast/astUtils';
import { Trait } from '../expectations/expectations';
import { workerI18n } from '../services/workerI18n';
import { JSONSchema7WithShortDescription } from '../types';
import { createData } from './dataUtils';

export const typeHandlers: { [type: string]: TypeHandler | undefined } = {};

export type CompatibleDescription = {
    translationKey: string;
    originalText: string | undefined;
};

export type TypeHandler = {
    schema: JSONSchema7;
    getDescription: (path: Path) => CompatibleDescription[];
    getSchemaByPath: (path: Path) => JSONSchema7Definition[];
};

const noop = () => {
    /* noop */
};

const makeTbObjectSchema = (trait: Trait): JSONSchema7 & { $tbTrait: Trait } => ({
    $tbTrait: trait
});

const rootSchema: JSONSchema7 = {
    title: `root`,
    type: 'object',
    properties: {
        view: {
            $ref: '#/definitions/view'
        },
        plugins: {
            type: 'array',
            items: {
                $ref: '#/definitions/plugin'
            },
            default: []
        },
        vars: {
            type: 'object',
            additionalProperties: true
        }
    },
    required: ['view']
};

const schemaDefinitions: Partial<{ [trait in Trait]: JSONSchema7Definition }> = {
    view: makeTbObjectSchema('view'),
    action: makeTbObjectSchema('action'),
    plugin: makeTbObjectSchema('plugin'),
    data: {
        anyOf: [
            makeTbObjectSchema('data'),
            { type: 'array' },
            { type: 'boolean' },
            { type: 'integer' },
            { type: 'null' },
            { type: 'number' },
            { type: 'object', additionalProperties: true },
            { type: 'string' }
        ]
    },
    reactive: makeTbObjectSchema('reactive'),
    dataRW: makeTbObjectSchema('dataRW'),
    condition: makeTbObjectSchema('condition'),
    root: rootSchema,
    any: true,
    never: false,
    contextual: makeTbObjectSchema('contextual'),
    'rw-contextual': makeTbObjectSchema('rw-contextual')
};

const traverseSchema = (
    schema: JSONSchema7Definition,
    objectPath: Path,
    onDescription: (description: CompatibleDescription) => void = noop,
    traversedPath: Path = []
): JSONSchema7Definition[] => {
    if (schema === true) return [true];
    if (typeof schema !== 'object') return [false];

    for (const descriptionField of ['shortDescription', 'description'] as const) {
        if ((schema as JSONSchema7WithShortDescription)[descriptionField]) {
            const translationKey = [...traversedPath, descriptionField].join('.');
            const originalText = (schema as JSONSchema7WithShortDescription)[descriptionField];

            onDescription({
                translationKey,
                originalText
            });

            break;
        }
    }

    if ('$ref' in schema) {
        const refPath = schema.$ref?.split('/') || [];
        const definition = refPath[refPath.length - 1] as Trait;

        if (definition in schemaDefinitions) {
            return traverseSchema(schemaDefinitions[definition]!, objectPath, onDescription)!;
        }
    }
    if ('anyOf' in schema) {
        const children = schema.anyOf!.map((childSchema) =>
            traverseSchema(childSchema, objectPath, onDescription, [...traversedPath, 'anyOf'])
        );
        const flattenChildren = children.reduce((acc, child) => [...acc, ...child], []);

        return flattenChildren;
    }

    if (objectPath.length === 0) {
        return [schema];
    }

    const chunk = objectPath[0];

    if (schema.type === 'object') {
        if (schema.properties && schema.properties[chunk]) {
            const result = traverseSchema(schema.properties[chunk], objectPath.slice(1), onDescription, [
                ...traversedPath,
                'properties',
                chunk
            ]);

            return result;
        } else if (typeof schema.additionalProperties === 'boolean') {
            return [schema.additionalProperties];
        } else if (schema.additionalProperties !== undefined) {
            const result = traverseSchema(schema.additionalProperties, objectPath.slice(1), onDescription, [
                ...traversedPath,
                'additionalProperties'
            ]);

            return result;
        } else {
            return [false];
        }
    } else if (schema.type === 'array') {
        if (typeof chunk !== 'number') return [false];

        if (Array.isArray(schema.items)) {
            return traverseSchema(schema.items[chunk], objectPath.slice(1), onDescription, [
                ...traversedPath,
                'items',
                chunk
            ]);
        } else if (typeof schema.items === 'object') {
            return traverseSchema(schema.items, objectPath.slice(1), onDescription, [...traversedPath, 'items']);
        } else {
            return [false];
        }
    } else {
        return [false];
    }
};

/**
 * Removes duplicated values from a list of available anyOf options, by filtering them by their enum values.
 * Sometimes, when anyOf options have enums with a similar scheme we can get duplicated suggestions in config.
 * @param {Object[]} entries - A list of schema entries obtained after traversal
 */

const dedupeSchemeEntries = (entries: JSONSchema7Definition[]): JSONSchema7Definition[] => {
    const result = [];
    let filter = new Set();

    const getUniqueValues = (enumValues: JSONSchema7Array) => {
        return enumValues.filter((el) => !filter.has(el));
    };

    for (const entry of entries) {
        if (typeof entry === 'object' && entry.enum) {
            const uniqueEnums = getUniqueValues(entry.enum);

            if (uniqueEnums.length > 0) {
                entry.enum = uniqueEnums;
                result.push(entry);
                filter = new Set([...filter, ...uniqueEnums]);
            }
        } else result.push(entry);
    }

    return result;
};

const flattenAnyOf = (schema: JSONSchema7Definition): JSONSchema7Definition[] => {
    if (typeof schema === 'boolean' || schema.anyOf === undefined) {
        return [schema];
    }
    const result = [];

    for (const option of schema.anyOf) {
        result.push(...flattenAnyOf(option));
    }

    return result;
};

const makeTypeHandler = (schema: JSONSchema7): TypeHandler => {
    const handler = {
        schema,
        getDescription: (objectPath: Path) => {
            const descriptions: CompatibleDescription[] = [];

            const translatedSchema = componentTranslateSchema(schema.title!, schema, []);

            traverseSchema(translatedSchema, objectPath, (newDescription) => descriptions.push(newDescription));

            return descriptions;
        },
        getSchemaByPath: (objectPath: Path) => {
            const anyOf = traverseSchema(schema, objectPath);

            const flattened = flattenAnyOf({ anyOf });

            return dedupeSchemeEntries(flattened);
        }
    };

    return handler;
};

const makeDataSchema = (type: string, mustHavePath: boolean = true, defaultPath = 'path') => {
    const data: JSONSchema7 = {
        title: `data.${type}`,
        type: 'object',
        properties: {
            type: {
                type: 'string',
                const: type
            },
            path: {
                type: 'string',
                default: defaultPath
            },
            default: true
        },
        default: createData(type, defaultPath),
        required: ['type']
    };

    if (mustHavePath) {
        data.required!.push('path');
    }

    return data;
};

typeHandlers['data.output'] = makeTypeHandler(makeDataSchema('output'));
typeHandlers['data.internal'] = makeTypeHandler(makeDataSchema('internal'));
typeHandlers['data.relative'] = makeTypeHandler(makeDataSchema('relative', false));

typeHandlers['data.input'] = makeTypeHandler(makeDataSchema('input'));
typeHandlers['data.local'] = makeTypeHandler(makeDataSchema('local', false, ''));

typeHandlers['root'] = makeTypeHandler(rootSchema);

const tolokaSchema: JSONSchema7 = {
    type: 'object',
    properties: {
        type: {
            type: 'string',
            const: 'plugin.toloka',
            description: workerI18n.t('pluginToloka.name')
        },
        layout: {
            type: 'object',
            properties: {
                kind: {
                    type: 'string',
                    enum: ['scroll', 'pager'],
                    description: workerI18n.t('pluginToloka.layoutKind')
                },
                taskWidth: {
                    type: 'number',
                    default: 300,
                    description: workerI18n.t('pluginToloka.layoutTaskWidth')
                }
            },
            required: ['kind'],
            description: workerI18n.t('pluginToloka.layoutDescription'),
            default: {
                kind: 'scroll',
                taskWidth: 300
            }
        }
    },
    required: ['layout', 'type'],
    default: {
        type: 'plugin.toloka',
        layout: {
            kind: 'scroll',
            taskWidth: 300
        }
    }
};

type FrontendIdm = { [service: string]: boolean };
export const frontendIdm: { current: FrontendIdm } = { current: {} };

type Subscriber = (frontendIdm: FrontendIdm) => void;
const subscribers: Subscriber[] = [];

export const subscribeToTypeHandlersUpdate = (cb: Subscriber) => {
    cb(frontendIdm.current);
    subscribers.push(cb);
};

export const setEditors = (editors: TbState['editors']) => {
    Object.entries(editors).forEach(([type, editor]) => {
        const schema = editor.schema as JSONSchema7 | undefined;

        if (schema && schema.title) {
            typeHandlers[schema.title] = makeTypeHandler(schema);
        } else {
            if (type !== 'core' && !editor.internal) {
                // eslint-disable-next-line no-console
                console.error('Expected title in schema of editor', editor, 'of', type);
            }
        }
    });

    subscribers.forEach((cb) => cb(frontendIdm.current));
};

export const setFrontendIdm = (newFrontendIdm: FrontendIdm) => {
    frontendIdm.current = newFrontendIdm;
    subscribers.forEach((cb) => cb(frontendIdm.current));
};

typeHandlers['plugin.toloka'] = makeTypeHandler(tolokaSchema);
