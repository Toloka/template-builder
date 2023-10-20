import * as checkboxEditor from '@toloka-tb/field.checkbox-group/field.checkbox-group.editor';
import * as ifEditor from '@toloka-tb/helper.if/helper.if.editor';
import * as sumEditor from '@toloka-tb/helper.sum/helper.sum.editor';
import * as switchEditor from '@toloka-tb/helper.switch/helper.switch.editor';
import * as transformEditor from '@toloka-tb/helper.transform/helper.transform.editor';
import { parseJSON } from '@toloka-tb/lang.json';
import * as listEditor from '@toloka-tb/view.list/view.list.editor';
import { JSONSchema7 } from 'json-schema';

import { getComponentPath } from '../ast/astUtils';
import { setEditors, typeHandlers } from '../typeHandlers/typeHandlers';
import { addSchemaExpectations, deriveExpectations, ExpectationManager } from './expectations';

setEditors({
    'field.checkbox-group': checkboxEditor,
    'helper.if': ifEditor,
    'helper.switch': switchEditor,
    'helper.sum': sumEditor,
    'helper.transform': transformEditor,
    'view.list': listEditor
});

describe('editor', () => {
    describe('addSchemaExpectations', () => {
        it('returns never on no schema', () => {
            const manager: ExpectationManager = Object.freeze({
                expectedType: 'value',
                addAlternative: jest.fn(),
                addRequirement: jest.fn(),
                isExpected: jest.fn(),
                log: jest.fn(),
                getOptions: jest.fn()
            });

            addSchemaExpectations([], manager);

            expect(manager.addAlternative).toHaveBeenCalledWith(['never']);
            expect(manager.addRequirement).not.toHaveBeenCalled();
        });

        it('returns [type] on typed schema', () => {
            const types = ['number', 'string', 'boolean', 'object', 'array'] as const;

            for (const type of types) {
                const manager: ExpectationManager = Object.freeze({
                    expectedType: 'value',
                    addAlternative: jest.fn(),
                    addRequirement: jest.fn(),
                    isExpected: jest.fn(),
                    log: jest.fn(),
                    getOptions: jest.fn()
                });

                addSchemaExpectations([{ type }], manager);

                expect(manager.addAlternative).toHaveBeenCalledWith([type]);
            }
        });

        it('returns trait from $tbTrait', () => {
            const schemas = [
                { $tbTrait: 'view' },
                { $tbTrait: 'data' },
                { $tbTrait: 'condition' },
                { $tbTrait: 'dataRW' },
                { $tbTrait: 'ref' },
                { $tbTrait: 'hotkey' }
            ] as const;

            for (const schema of schemas) {
                const manager: ExpectationManager = Object.freeze({
                    expectedType: 'value',
                    addAlternative: jest.fn(),
                    addRequirement: jest.fn(),
                    isExpected: jest.fn(),
                    log: jest.fn(),
                    getOptions: jest.fn()
                });

                addSchemaExpectations([schema as any], manager);

                expect(manager.addAlternative).toHaveBeenCalledWith([schema.$tbTrait]);
            }
        });
    });

    describe('deriveExpectations', () => {
        it('derives key schema correctly', () => {
            const config = `
            {
                "view": {
                    "type": "view.text",
                    "content": "text"
                }
            }
            `;
            const { value } = parseJSON(config);
            const path = getComponentPath(value!, config.indexOf('view'));

            const expectations = deriveExpectations(path, { expectFilledCollections: true });

            expect(expectations.options.schemas).toMatchObject([typeHandlers['root']!.schema]);
        });

        it('derives value expectations correctly', () => {
            const config = `
            {
                "type": "helper.sum",
                "items": [
                    10,
                    9,
                    -5
                ]
            }
            `;
            const { value } = parseJSON(config);
            const path = getComponentPath(value!, config.indexOf('9'));

            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['number']]);
        });

        it('treats if as generic', () => {
            const config = `
            {
                "type": "helper.sum",
                "items": [
                    10,
                    {
                        "type": "helper.if",
                        "condition": true,
                        "then": 9,
                        "else": -5
                    }
                ]
            }
            `;
            const { value } = parseJSON(config);
            const path = getComponentPath(value!, config.indexOf('9'));

            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['number']]);
        });

        it('correctly derives form parent in ifs', () => {
            const config = `
            {
                "type": "helper.sum",
                "items": [
                    10,
                    {
                        "type": "helper.if",
                        "condition": true,
                        "then": {
                            "type": "data.output",
                        },
                        "else": -5
                    }
                ]
            }
            `;
            const { value } = parseJSON(config);
            const path = getComponentPath(value!, config.indexOf('data.output'));

            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['number']]);
        });

        it('adjusts paths in ifs', () => {
            const config = `
            {
                "type": "helper.sum",
                "items": {
                    "type": "helper.if",
                    "condition": true,
                    "then": [9],
                    "else": [-5]
                }
            }
            `;
            const { value } = parseJSON(config);
            const path = getComponentPath(value!, config.indexOf('9'));

            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['number']]);
        });

        it('adjusts paths in helper.transform', () => {
            const config = `
            {
                "view": {
                  "type": "view.list",
                  "items": {
                    "type": "helper.transform",
                    "items": [
                      {
                        "name": "Alice"
                      },
                      {
                        "name": "Bob"
                      }
                    ],
                    "into": 10
                  }
                }
              }
              `;

            const { value } = parseJSON(config);
            const path = getComponentPath(value!, config.indexOf('10'));

            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['view']]);
        });

        it('treats switch as generic', () => {
            const config = `
            {
                "type": "helper.sum",
                "items": [{
                    "type": "helper.switch",

                    "cases": [
                        {
                            "condition": true,
                            "result": 9,
                        },
                        {
                            "condition": true,
                            "result": 10,
                        }
                    ],
                    "default": -5
                }]
            }
            `;

            const { value } = parseJSON(config);

            // default
            const path2 = getComponentPath(value!, config.indexOf('-5'));
            const expectations2 = deriveExpectations(path2, { expectFilledCollections: false });

            expect(expectations2.manager.getOptions()).toEqual([['number']]);

            // result
            const path = getComponentPath(value!, config.indexOf('9'));
            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['number']]);
        });

        it('correctly handles nested generics', () => {
            const config = `
            {
                "view": {
                    "type": "view.list",
                    "items": {
                        "type": "helper.transform",
                        "items": [
                            1,
                            2
                        ],
                        "into": {
                            "type": "helper.if",
                            "condition": {
                            "type": "condition.empty",
                            "data": {
                                "type": "data.input",
                                "path": "path"
                            }
                            },
                            "then": 10
                        }
                    }
                }
              }
              `;

            const { value } = parseJSON(config);
            const path = getComponentPath(value!, config.indexOf('10'));
            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['view']]);
        });

        it('adjusts paths in switches', () => {
            const config = `
            {
                "type": "helper.sum",
                "items": {
                    "type": "helper.switch",

                    "cases": [
                        {
                            "condition": true,
                            "result": [9],
                        },
                        {
                            "condition": true,
                            "result": [10],
                        }
                    ],
                    "default": [-5]
                }
            }
            `;

            const { value } = parseJSON(config);

            // default
            const path2 = getComponentPath(value!, config.indexOf('-5'));
            const expectations2 = deriveExpectations(path2, { expectFilledCollections: false });

            expect(expectations2.manager.getOptions()).toEqual([['number']]);

            // result
            const path = getComponentPath(value!, config.indexOf('9'));
            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            expect(expectations.manager.getOptions()).toEqual([['number']]);
        });

        it('correctly derives keys', () => {
            const config = `
            {
                "type": "field.checkbox-group",
                "options": {
                    "type": "helper.if",
                    "condition": {
                        "type": "condition.not",
                        "condition": {
                            "type": "condition.schema",
                            "data": {
                                "type": "data.input",
                                "path": "query_type"
                            },
                            "schema": {
                                "type": "string",
                                "const": "By store name"
                            }
                        }
                    },
                    "then": [
                        {
                            "label": "Good",
                            "value": "good"
                        },
                        {
                            "label": "Acceptably",
                            "value": "acceptably"
                        },
                        {
                            "label": "Bad",
                            "value": "bad"
                        }
                    ],
                    "else": [
                        {
                            "label": "Good",
                            "value": "good"
                        },
                        {
                            "label": "Bad",
                            "value": "bad"
                        }
                    ]
                },
                "data": {
                    "type": "data.output",
                    "path": "result"
                }
            }
            `;

            const { value } = parseJSON(config);

            const path = getComponentPath(value!, config.indexOf('label'));
            const expectations = deriveExpectations(path, { expectFilledCollections: false });

            const optionsSchema = typeHandlers['field.checkbox-group']!.schema.properties!.options as JSONSchema7;

            expect(expectations.manager.getOptions()).toEqual([['key']]);
            expect(expectations.options.schemas).toMatchObject([optionsSchema.items!]);
        });
    });
});
