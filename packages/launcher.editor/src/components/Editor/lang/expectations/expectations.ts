import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { ComponentPath } from '../ast/astUtils';
import { workerI18n } from '../services/workerI18n';
import { typeHandlers } from '../typeHandlers/typeHandlers';
import { adjustForGenericsRecursevely } from '../utils/adjustForGenerics';
import { replaceWithParent } from '../utils/replaceWithParent';

export type ExpectationType = 'key' | 'type' | 'value';
export type Options = { componentPath: ComponentPath; schemas: JSONSchema7Definition[] };
export const primitives: Trait[] = ['string', 'number', 'integer', 'boolean', 'null', 'object', 'array'];

export type Trait =
    // primitives
    | 'key'
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'null'
    // collections
    | 'object'
    | 'array'
    // tb
    | 'view'
    | 'action'
    | 'plugin'
    | 'data'
    | 'reactive'
    | 'dataRW'
    | 'condition'
    // config
    | 'root'
    // utility
    | 'any'
    | 'never'
    | 'string-static'
    // contextual
    | 'contextual'
    | 'rw-contextual';

export type ExpectationManager = {
    expectedType: ExpectationType;
    isExpected: (item: Trait[]) => boolean;
    addAlternative: (option: Trait[]) => void;
    addRequirement: (trait: Trait) => void;
    toString: () => string;
    getOptions: () => Trait[][];
    log: () => void;
};

const makeManager = (expectedType: ExpectationType = 'value') => {
    const options: Trait[][] = [];
    const manager: ExpectationManager = {
        expectedType,
        addAlternative: (option) => options.push(option),
        addRequirement: (trait) => {
            options.forEach((option) => option.push(trait));
        },
        isExpected: (item) => {
            return options.some((option) => {
                for (const trait of option) {
                    if (!item.includes(trait)) {
                        return false;
                    }
                }

                return true;
            });
        },
        toString: () =>
            options
                .map((option) =>
                    option
                        .map((trait) => {
                            const traitText = trait === 'string-static' ? 'string' : trait;

                            return (
                                workerI18n.t(`expectations.${traitText}`) ||
                                workerI18n.t(`expectations.like`, { suggestion: traitText })
                            );
                        })
                        .join(` ${workerI18n.t('expectations.and')} `)
                )
                .join(` ${workerI18n.t('expectations.or')} `) || '',
        getOptions: () => options,
        log: () =>
            // eslint-disable-next-line no-console
            console.log(manager.toString())
    };

    return manager;
};

export const addSchemaExpectations = (providedSchema: JSONSchema7Definition[], manager: ExpectationManager): void => {
    const schemas = providedSchema.filter((schema) => schema !== false);

    if (schemas.length === 0) {
        manager.addAlternative(['never']);

        return;
    }

    for (const schemaDef of schemas) {
        const schema = schemaDef as JSONSchema7;

        if (schemaDef === true) {
            manager.isExpected = () => true;
            manager.addAlternative(['any']);
        } else if ('$tbTrait' in schema) {
            const trait = schema['$tbTrait'] as Trait;

            if (trait === 'any') {
                return addSchemaExpectations([true], manager);
            }
            if (trait === 'data') {
                primitives.forEach((primitive) => manager.addAlternative([primitive]));
            }

            manager.addAlternative([trait]);
        } else if (schema.type && !manager.isExpected(['root'])) {
            const types = Array.isArray(schema.type) ? schema.type : [schema.type];

            types.forEach((type) => manager.addAlternative([type]));
        }
    }
};

const isKeySpot = (componentPath: ComponentPath) =>
    componentPath.tail.type === 'object' || componentPath.kind === 'key';

const validatedByParent = (componentPath: ComponentPath) =>
    componentPath.path[0] === 'type' || (componentPath.path.length === 0 && componentPath.type !== 'root');

type deriveOptions = {
    expectFilledCollections: boolean;
};

export const deriveExpectations = (
    componentPath: ComponentPath,
    options: deriveOptions
): { manager: ExpectationManager; options: Options } => {
    // ensure we derive expectations for correct spot
    const adjustedPath = adjustForGenericsRecursevely(componentPath);

    if (adjustedPath !== componentPath) {
        return deriveExpectations(adjustedPath, options);
    }

    const manager = makeManager();
    const handler = typeHandlers[componentPath.type];

    let schemas: JSONSchema7Definition[] = handler ? handler.getSchemaByPath(componentPath.path) : [];

    // keys
    if (options.expectFilledCollections ? isKeySpot(componentPath) : componentPath.kind === 'key') {
        manager.expectedType = 'key';
        manager.addAlternative(['key']);
        // use owner's schema
        if (componentPath.kind === 'key') {
            schemas = handler ? handler.getSchemaByPath(componentPath.path.slice(0, -1)) : [];
        }
        // values
    } else {
        if (componentPath.tail.type === 'missing' && componentPath.tail.from === 0) {
            manager.expectedType = 'value';
            manager.addAlternative(['root']);
            // objects w/ type property
        } else if (validatedByParent(componentPath)) {
            const parentPath = replaceWithParent(componentPath);
            const adjustedPath = adjustForGenericsRecursevely(parentPath);

            const parentHandler = typeHandlers[adjustedPath.type];

            if (parentHandler) {
                schemas = parentHandler.getSchemaByPath(adjustedPath.path);
            }

            if (componentPath.path[0] === 'type') {
                manager.expectedType = 'type';
            } else {
                manager.expectedType = 'value';
            }
            // deeper values
        } else if (handler) {
            // potentially a bug with nested arrays, which we don't have anyway

            if (
                options.expectFilledCollections &&
                typeof schemas[0] === 'object' &&
                schemas[0].type === 'array' &&
                componentPath.tail.type === 'array'
            ) {
                schemas = handler.getSchemaByPath([...componentPath.path, 0]);
            }

            manager.expectedType = 'value';
        }

        addSchemaExpectations(schemas, manager);
    }

    return { manager, options: { schemas, componentPath } };
};
