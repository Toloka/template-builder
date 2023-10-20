import { JSONSchema7 } from 'json-schema';

import hiddenTypes from './hidden-types.json';
import { ComponentPath } from '../ast/astUtils';
import { ExpectationManager, primitives, Trait } from '../expectations/expectations';
import { subscribeToTypeHandlersUpdate, typeHandlers } from '../typeHandlers/typeHandlers';
import { JSONSchema7WithShortDescription } from '../types';
import { getArchetype } from './getArchetype';

let trait2type: { [trait: string]: string[] } = {};

const update = () => {
    const allTypes = Object.keys(typeHandlers);

    const types = allTypes.filter((type) => {
        if (!typeHandlers[type]?.schema) return false;

        return true;
    });

    const helpers = types.filter((key) => getArchetype(key) === 'helper');
    const simpleData = types
        .filter((key) => getArchetype(key) === 'data')
        .filter((key) => key !== 'data.local' && key !== 'data.relative');

    trait2type = {
        action: types.filter((type) => getArchetype(type) === 'action'),
        plugin: types.filter((type) => getArchetype(type) === 'plugin'),
        view: types.filter(
            (type) => getArchetype(type) === 'layout' || getArchetype(type) === 'view' || getArchetype(type) === 'field'
        ),
        dataRW: ['data.internal', 'data.output'],
        reactive: ['data.internal', 'data.output', '@toloka/data.location'],
        contextual: ['data.local'],
        'rw-contextual': ['data.relative'],
        data: helpers.concat(simpleData),
        condition: types.filter((type) => getArchetype(type) === 'condition'),
        ...primitives.reduce((acc, primitive) => ({ ...acc, [primitive]: helpers.concat(simpleData) }), {}),
        boolean: types.filter((type) => getArchetype(type) === 'condition').concat(helpers)
    };
};

subscribeToTypeHandlersUpdate(update);

export const getTbTypeDoc = (schema: JSONSchema7) => {
    const doc = (schema as JSONSchema7WithShortDescription).shortDescription || schema.description;
    const typeDoc =
        schema.properties &&
        typeof schema.properties.type === 'object' &&
        ((schema.properties.type as JSONSchema7WithShortDescription).shortDescription ||
            schema.properties.type.description);

    return doc || typeDoc || undefined;
};

export const getPossibleTypes = (expectations: ExpectationManager, componentPath: ComponentPath): string[] => {
    const suggestionTypes = new Set<string>();

    if (expectations.isExpected(['root'])) {
        return [];
    }

    if (
        !(
            (componentPath.globalPath[0] === 'plugins' || componentPath.globalPath[0] === 'vars') &&
            componentPath.globalPath.length === 1 &&
            componentPath.tail.type === 'missing'
        )
    ) {
        Object.keys(trait2type).forEach((key) => {
            const trait = key as keyof typeof trait2type;

            if (expectations.isExpected([trait as Trait])) {
                trait2type[trait].forEach((type) => suggestionTypes.add(type));
            }
        });
    } else {
        if (expectations.isExpected(['plugin'])) {
            trait2type.plugin.forEach((type) => suggestionTypes.add(type));
        }
    }

    if (
        expectations.isExpected(['string', 'number', 'integer', 'boolean', 'null', 'object', 'array', 'data']) &&
        componentPath.readableContext
    ) {
        trait2type.contextual.forEach((type) => suggestionTypes.add(type));
    }
    if (expectations.isExpected(['dataRW', 'data']) && componentPath.writableContext) {
        trait2type['rw-contextual'].forEach((type) => suggestionTypes.add(type));
    }

    if (!expectations.isExpected(['plugin']) && !expectations.isExpected(['string-static'])) {
        suggestionTypes.add('helper.if');
        suggestionTypes.add('helper.switch');
    }

    if (
        componentPath.parents.some((parent) => parent.type === 'plugin.toloka') ||
        componentPath.type === 'plugin.toloka'
    ) {
        return [...suggestionTypes].filter((type) => {
            if (
                (getArchetype(type) === 'view' && !['view.text', 'view.markdown'].includes(type)) ||
                getArchetype(type) === 'field' ||
                getArchetype(type) === 'layout'
            ) {
                return false;
            }

            return true;
        });
    }

    return [...suggestionTypes];
};

export const excludeHiddenTypes = (types: string[], frontendIdm: { [service: string]: boolean }) =>
    types
        .filter((type) => !hiddenTypes[type as keyof typeof hiddenTypes])
        .filter((type) => {
            if (!type.startsWith('@')) return true;

            return frontendIdm[type.split('/')[0]];
        });

export const getPossibleSuggestedTypes = (
    expectations: ExpectationManager,
    componentPath: ComponentPath,
    frontendIdm: { [service: string]: boolean }
) => {
    return excludeHiddenTypes(getPossibleTypes(expectations, componentPath), frontendIdm);
};
