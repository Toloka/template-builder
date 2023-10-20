/* eslint-disable max-depth */
import { JSONSchema7 } from 'json-schema';

import { componentTranslateSchema } from '../../../../../../i18n/componentsI18n';
import { editorI18n } from '../../../../../../i18n/editorI18n';
import { JSONSchema7WithShortDescription } from '../../../types';
import { AutoCompleteProvider, makeKey, makeResult, ProviderResult } from '../suggestionTypes';

const getDescription = (schema: JSONSchema7, prop: string) => {
    if (prop === 'type') {
        return editorI18n.t('componentTypeDescription');
    }
    if (schema.properties) {
        const propSchema = schema.properties[prop];

        if (typeof propSchema === 'object') {
            return (propSchema as JSONSchema7WithShortDescription).shortDescription || propSchema.description;
        }
    }

    return;
};

const isEmptyCollection = (item: unknown) => {
    if (item === '') {
        return true;
    }

    if (typeof item !== 'object') {
        return false;
    }

    if (!item) {
        return false;
    }

    if (Array.isArray(item) && item.length === 0) {
        return true;
    }

    if (Object.keys(item).length === 0) {
        return true;
    }

    return false;
};

export const schemaProvider: AutoCompleteProvider = (expectation, { schemas, componentPath }) => {
    const objectSchemas = schemas
        .filter((schema) => typeof schema !== 'boolean')
        .map((schema) => componentTranslateSchema(componentPath.type, schema as JSONSchema7, componentPath.path));

    if (objectSchemas.length === 0) return [];

    // suggest keys
    if (expectation.expectedType === 'key') {
        const existingKeys: string[] = [];
        const keyOwner = componentPath.tail.type === 'key' ? componentPath.tail.owner : componentPath.tail;
        const suitableSchemasToggler: boolean[] = Array(objectSchemas.length).fill(true);

        // iterating over keys seems more usable then filtering schemas
        if (keyOwner && keyOwner.type === 'object') {
            keyOwner.props.forEach((prop) => {
                if (prop.key.type === 'key') {
                    existingKeys.push(prop.key.value);

                    for (let i = 0; i < objectSchemas.length; i++) {
                        const schema = objectSchemas[i] as JSONSchema7;

                        const key = prop.key.value;

                        // schema allows any keys or user is in progress of filling keys of this schema
                        // yeah, this can fail for case when one schema uses substring keys of another like
                        // oneOf: [{properties: {label: ""}}, {properties: {labelWithEmoji: ""}}]
                        // but that is unlikely to happen
                        if (
                            !(
                                schema.additionalProperties ||
                                (schema.properties &&
                                    Object.keys(schema.properties).some((schemaKey) => schemaKey.startsWith(key)))
                            )
                        ) {
                            suitableSchemasToggler[i] = false;
                        }
                    }
                }
            });
        }

        const suitableSchemas = objectSchemas.filter((_, index) => suitableSchemasToggler[index]);
        const suggestions: { [key: string]: ProviderResult } = {};

        for (const schema of suitableSchemas) {
            if (!existingKeys.includes('type') && componentPath.path.length > 0) {
                suggestions['type'] = makeKey('type', 10, getDescription(schema as JSONSchema7, 'type'));
            }
            if (schema.properties) {
                const keys = Object.keys(schema.properties);

                for (const key of keys) {
                    if (
                        !existingKeys.includes(key) &&
                        !(schema.properties[key] as { preventSuggest?: boolean }).preventSuggest
                    ) {
                        suggestions[key] = makeKey(key, 10, getDescription(schema as JSONSchema7, key));
                    }
                }
            }
        }

        return Object.values(suggestions);
    }

    // suggest values
    if (expectation.expectedType === 'value') {
        // we assume that default is always expected
        const options: ProviderResult[] = [];

        for (const schema of objectSchemas) {
            if (schema.enum) {
                options.push(...schema.enum.map((option) => makeResult(option, 100, {})));
            } else if ('const' in schema) {
                if (!isEmptyCollection(schema.const)) {
                    options.push(
                        makeResult(schema.const, 100, {
                            documentation:
                                (schema as JSONSchema7WithShortDescription).shortDescription || schema.description
                        })
                    );
                }
                // potentially a bug with nested arrays, which we don't have anyway
            } else if ('default' in schema) {
                if (!isEmptyCollection(schema.default)) {
                    options.push(
                        makeResult(schema.default, 98, {
                            documentation:
                                (schema as JSONSchema7WithShortDescription).shortDescription || schema.description
                        })
                    );
                }
            }
        }

        return options;
    }

    return [];
};
