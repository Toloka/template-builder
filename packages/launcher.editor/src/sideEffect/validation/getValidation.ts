import { compileConfig, createLock } from '@toloka-tb/bootstrap';
import { alwaysPassSchema, TbJSONSchema, TbJSONSchemaDefinition } from '@toloka-tb/component2schema';
import { getByPath } from '@toloka-tb/core/access/getByPath';
import { CompilationHook, JSONConfig } from '@toloka-tb/core/compileConfig/compileConfig';
import { toJS } from 'mobx';

import { getArchetype } from '../../components/Editor/lang/utils/getArchetype';
import { conditionsMap, fieldsMap } from './conditionTransformer';
import { schema2tolokaDataSpec } from './schema2toloka';
import {
    addVariationToSchema,
    allowAdditionalProperties,
    insertToSchema,
    replaceAlwaysPassSchema,
    verifyStaticPath
} from './schemaEditor';
import { getSchemaFromExample } from './schemaFromExample';
import { TolokaDataSpec } from './TolokaTyping';

conditionsMap['transformation-core-condition.schema'] = {
    condition2Schema: (props: { required: boolean; schema: TbJSONSchemaDefinition }) => props
};

export type DataConfig = { type: string; path: unknown; default?: unknown; schema?: TbJSONSchemaDefinition };
export type ConditionConfig = { type: string; data?: DataConfig; [key: string]: unknown };
export type ValidationIssue = { key: string; params?: { [param: string]: string } };

type ConfigEntity = {
    path: string;
    fallbackDataConfig?: DataConfig;
    config: DataConfig | ConditionConfig;
};

export type IOValidation = {
    schema: {
        root: {
            type: 'object';
            properties: {
                input: TbJSONSchema;
                output: TbJSONSchema;
            };
            required: ['input', 'output'];
        };
        issues: {
            input: ValidationIssue[];
            output: ValidationIssue[];
        };
    };
    spec: {
        input: TolokaDataSpec;
        output: TolokaDataSpec;
        issues: {
            input: ValidationIssue[];
            output: ValidationIssue[];
        };
    };
    issues: ValidationIssue[];
};

const makeEmptyResult = (): IOValidation => ({
    schema: {
        root: {
            type: 'object',
            properties: {
                input: { type: 'object' },
                output: { type: 'object' }
            },
            required: ['input', 'output']
        },
        issues: {
            input: [],
            output: []
        }
    },
    spec: {
        input: {},
        output: {},
        issues: {
            input: [],
            output: []
        }
    },
    issues: []
});

type ConfigEntities = {
    inputData: ConfigEntity[];
    outputData: ConfigEntity[];
    conditions: ConfigEntity[];
};

const analyzeConfig = async (config: JSONConfig) => {
    const inputData: ConfigEntity[] = [];
    const outputData: ConfigEntity[] = [];
    const conditions: ConfigEntity[] = [];

    const compilationHook: CompilationHook = (source, _, path) => {
        if (source && 'type' in source && typeof source.type === 'string') {
            if (source.type === 'data.input' && 'path' in source) {
                inputData.push({ config: source, path });
            }
            if (source.type === 'data.output' && 'path' in source) {
                outputData.push({ config: source, path });
            }
            if (getArchetype(source.type) === 'field') {
                if (source.data && source.data.type === 'data.output') {
                    if (source.validation) {
                        conditions.push({
                            config: source.validation,
                            path: `${path}.validation`,
                            fallbackDataConfig: source.data
                        });
                    }
                    if (fieldsMap[source.type] !== undefined && fieldsMap[source.type].getDataSchema !== undefined) {
                        conditions.push({
                            config: {
                                type: 'transformation-core-condition.schema',
                                schema: fieldsMap[source.type].getDataSchema!(source) || alwaysPassSchema,
                                data: {
                                    type: 'data.output',
                                    path: source.data.path
                                }
                            },
                            path,
                            fallbackDataConfig: source.data
                        });
                    }
                }
            }
            if (getArchetype(source.type) === 'view' && source.validation) {
                conditions.push({
                    config: source.validation,
                    path: `${path}.validation`
                });
            }
        }
    };

    const lock = await createLock({ config });

    await compileConfig({ config, lock, hooks: [compilationHook], envApi: {} });

    return {
        inputData,
        outputData,
        conditions
    };
};

const hasStaticPath = (config: DataConfig | ConditionConfig) => typeof config.path === 'string';
const generateValidation = async (config: JSONConfig, inputExample: object): Promise<IOValidation> => {
    const result = makeEmptyResult();
    const dynamicPaths = {
        output: false,
        input: false
    };

    const inputSchemaIssues: ValidationIssue[] = [];
    const outputSchemaIssues: ValidationIssue[] = [];

    let configEntities: ConfigEntities;

    try {
        configEntities = await analyzeConfig(config);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);

        result.issues.push({ key: 'schemaGen.invalidConfig' });

        return result;
    }

    const { inputData, outputData, conditions } = configEntities;

    // filling input schema
    const handeledInputExampleFields: { [path: string]: true } = {};

    for (const data of inputData) {
        if (hasStaticPath(data.config)) {
            const path = ['input', data.config.path as string].filter((pathPart) => pathPart !== '').join('.');

            handeledInputExampleFields[path] = true;
            insertToSchema(result.schema.root, path, true);
            const dataExample = getByPath(inputExample, data.config.path as string);
            const schemaFromExample = getSchemaFromExample(dataExample);

            const condition = {
                type: 'transformation-core-condition.schema',
                schema: data.config.schema || schemaFromExample || alwaysPassSchema,
                required: typeof data.config.default === 'undefined',
                data: {
                    type: 'data.input',
                    path
                }
            };

            addVariationToSchema({
                schemaToBeExtended: result.schema.root,
                dataPath: condition.data!.path,
                condition,
                dataMayBeRequired: true
            });
        } else {
            dynamicPaths.input = true;
            inputSchemaIssues.push({ key: 'schemaGen.dynamicPath', params: { path: data.path } });
        }
    }

    // traversing input data example for unhandled fields
    const traverseInputExample = (inputExamplePart: object, path: string) => {
        for (const key in inputExamplePart) {
            const property = (inputExamplePart as any)[key];
            const subPath = ['input', path, key].filter((pathPart) => pathPart !== '').join('.');
            const inputExamplePath = [path, key].filter((pathPart) => pathPart !== '').join('.');

            if (typeof property === 'object' && property !== null) {
                traverseInputExample(property, inputExamplePath);
            } else if (!handeledInputExampleFields[subPath]) {
                handeledInputExampleFields[subPath] = true;
                insertToSchema(result.schema.root, subPath, true);
                const dataExample = getByPath(inputExample, inputExamplePath);
                const schemaFromExample = getSchemaFromExample(dataExample);

                const condition = {
                    type: 'transformation-core-condition.schema',
                    schema: schemaFromExample || alwaysPassSchema,
                    required: false,
                    data: {
                        type: 'data.input',
                        path
                    }
                };

                addVariationToSchema({
                    schemaToBeExtended: result.schema.root,
                    dataPath: subPath,
                    condition,
                    dataMayBeRequired: true
                });
            }
        }
    };

    traverseInputExample(inputExample, '');

    // filling output schema

    for (const data of outputData) {
        if (typeof data.config.path === 'string') {
            const path = ['output', data.config.path].filter((pathPart) => pathPart !== '').join('.');

            insertToSchema(result.schema.root, path, true);
        } else {
            dynamicPaths.output = true;
            outputSchemaIssues.push({ key: 'schemaGen.dynamicPath', params: { path: data.path } });
        }
    }

    for (const condition of conditions) {
        const conditionConfig = condition.config as ConditionConfig;
        const data = conditionConfig.data || condition.fallbackDataConfig;

        if (data && hasStaticPath(data)) {
            const dataPath = ['output', data.path].filter((pathPart) => pathPart !== '').join('.');

            addVariationToSchema({
                schemaToBeExtended: result.schema.root,
                dataPath,
                condition: conditionConfig,
                dataMayBeRequired: verifyStaticPath(config, condition.path),
                fallbackData: data
            });
        }
    }

    if (dynamicPaths.input) {
        allowAdditionalProperties(result.schema.root.properties.input);
    }
    if (dynamicPaths.output) {
        allowAdditionalProperties(result.schema.root.properties.output);
    }

    replaceAlwaysPassSchema(result.schema.root.properties.input);
    replaceAlwaysPassSchema(result.schema.root.properties.output);

    // Making Toloka validation

    const tolokaInput = schema2tolokaDataSpec(result.schema.root.properties.input, 'input');
    const tolokaOutput = schema2tolokaDataSpec(result.schema.root.properties.output, 'output');

    result.spec.input = tolokaInput.spec;
    result.spec.issues.input = [...inputSchemaIssues, ...tolokaInput.issues];
    result.spec.output = tolokaOutput.spec;
    result.spec.issues.output = [...outputSchemaIssues, ...tolokaOutput.issues];

    return result;
};

export const getValidation = async (obj: object, inputExample: object) => {
    const config = toJS(obj as JSONConfig, { recurseEverything: true });

    try {
        return await generateValidation(config, inputExample);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        const result = makeEmptyResult();

        result.issues.push({ key: 'schemaGen.unhandledException' });

        return result;
    }
};
