/* eslint-disable no-param-reassign */
import { getByPath } from '@toloka-tb/core/access/getByPath';
import { JSONSchema7Definition } from 'json-schema';
import { toJS } from 'mobx';

import { Path } from '../components/Editor/lang/ast/astUtils';
import { tbStore } from '../store/tbStore';

export type ComponentKeysets = { [keyset: string]: { [key: string]: string } };
let componentKeysets: ComponentKeysets = {};

export const setComponentKeysets = (keysets: ComponentKeysets) => (componentKeysets = keysets);
export const getComponentKeysets = () => componentKeysets;

export const componentTranslateString = (componentType: string, key: string) => {
    const translations = componentKeysets[componentType];

    if (!translations) return;

    return translations[key === 'properties.type.description' ? 'description' : key];
};

const objPath2SchemaPath = (schema: JSONSchema7Definition, objectPath: Path): Path => {
    if (schema === true) return [];
    if (typeof schema !== 'object') return [];

    if ('$ref' in schema) {
        return [];
    }
    if ('anyOf' in schema) {
        return ['anyOf', ...objPath2SchemaPath(schema.anyOf![0], objectPath)];
    }

    if (objectPath.length === 0) {
        return [];
    }

    const chunk = objectPath[0];

    if (schema.type === 'object') {
        if (schema.properties && schema.properties[chunk]) {
            return ['properties', chunk, ...objPath2SchemaPath(schema.properties[chunk], objectPath.slice(1))];
        } else if (schema.additionalProperties === true) {
            return [
                'additionalProperties',
                chunk,
                ...objPath2SchemaPath(schema.additionalProperties, objectPath.slice(1))
            ];
        } else if (schema.additionalProperties !== undefined) {
            return ['additionalProperties', ...objPath2SchemaPath(schema.additionalProperties, objectPath.slice(1))];
        } else {
            return [];
        }
    } else if (schema.type === 'array') {
        if (Array.isArray(schema.items)) {
            return [
                'items',
                chunk,
                ...objPath2SchemaPath(
                    schema.items[typeof chunk === 'number' ? chunk : parseInt(chunk, 10)],
                    objectPath.slice(1)
                )
            ];
        } else if (typeof schema.items === 'object') {
            return ['items', ...objPath2SchemaPath(schema.items, objectPath.slice(1))];
        } else {
            return [];
        }
    } else {
        return [];
    }
};

export const componentTranslateSchema = <T extends object>(component: string, pureSchema: T, propertyPath: Path): T => {
    if (!component) return pureSchema;

    const editor = tbStore.editors[component];

    if (!editor) return pureSchema;
    if (!editor.schema) return pureSchema;

    const inSchemaPath = objPath2SchemaPath(editor.schema, propertyPath).join('.');

    const translations = componentKeysets[component];

    const translatedSchema = toJS(pureSchema, { recurseEverything: true });

    for (const fullKey in translations) {
        if (!inSchemaPath || fullKey.startsWith(inSchemaPath)) {
            const key = fullKey.substr(inSchemaPath ? inSchemaPath.length + 1 : 0);
            const lastKeyPart = key.split('.').pop()!;
            const parentPath = key.split('.').slice(0, -1);
            const parent = key ? getByPath(translatedSchema, parentPath) : key;

            if (parent) {
                parent[lastKeyPart] = translations[fullKey];
            }
        }
    }

    return translatedSchema;
};
