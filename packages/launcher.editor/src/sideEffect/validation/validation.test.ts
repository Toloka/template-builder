const bootstrap = require('@toloka-tb/bootstrap');

import * as core from '@toloka-tb/core';

bootstrap.compileConfig = ({ config, hooks }: { config: any; hooks: any }) => {
    return core.compileConfig(config, { core: core as any, hooks });
};

import * as conditionAll from '@toloka-tb/condition.all';
import * as conditionAllEditor from '@toloka-tb/condition.all/condition.all.editor';
import * as conditionEquals from '@toloka-tb/condition.equals';
import * as conditionEqualsEditor from '@toloka-tb/condition.equals/condition.equals.editor';
import * as conditionMore from '@toloka-tb/condition.more';
import * as conditionMoreEditor from '@toloka-tb/condition.more/condition.more.editor';
import * as conditionNot from '@toloka-tb/condition.not';
import * as conditionNotEditor from '@toloka-tb/condition.not/condition.not.editor';
import * as conditionRequired from '@toloka-tb/condition.required';
import * as conditionRequiredEditor from '@toloka-tb/condition.required/condition.required.editor';
import * as fieldButtonRadioGroup from '@toloka-tb/field.button-radio-group/field.button-radio-group';
import * as fieldButtonRadioGroupEditor from '@toloka-tb/field.button-radio-group/field.button-radio-group.editor';
import * as fieldCheckbox from '@toloka-tb/field.checkbox';
import * as feildCheckboxGroup from '@toloka-tb/field.checkbox-group';
import * as feildCheckboxGroupEditor from '@toloka-tb/field.checkbox-group/field.checkbox-group.editor';
import * as fieldCheckboxEditor from '@toloka-tb/field.checkbox/field.checkbox.editor';
import * as fieldNumber from '@toloka-tb/field.number';
import * as fieldNumberEditor from '@toloka-tb/field.number/field.number.editor';
import * as fieldText from '@toloka-tb/field.text';
import * as fieldTextEditor from '@toloka-tb/field.text/field.text.editor';
import * as helperIf from '@toloka-tb/helper.if';
import * as helperIfEditor from '@toloka-tb/helper.if/helper.if.editor';
import * as helperJoin from '@toloka-tb/helper.join';
import * as helperJoinEditor from '@toloka-tb/helper.join/helper.join.editor';
import * as viewList from '@toloka-tb/view.list';
import * as viewListEditor from '@toloka-tb/view.list/view.list.editor';
import * as viewText from '@toloka-tb/view.text';
import * as viewTextEditor from '@toloka-tb/view.text/view.text.editor';

import { tbStore } from '../../store/tbStore';
import { getValidation } from './getValidation';

core.register(conditionAll.create(core));
core.register(conditionEquals.create(core));
core.register(conditionMore.create(core));
core.register(conditionNot.create(core));
core.register(conditionRequired.create(core));
core.register(fieldCheckbox.create(core));
core.register(fieldNumber.create(core));
core.register(fieldText.create(core));
core.register(helperIf.create(core));
core.register(helperJoin.create(core));
core.register(viewText.create(core));
core.register(viewList.create(core));
core.register(fieldButtonRadioGroup.create(core));
core.register(feildCheckboxGroup.create(core));

tbStore.editors = {
    'condition.all': conditionAllEditor as any,
    'condition.equals': conditionEqualsEditor as any,
    'condition.more': conditionMoreEditor as any,
    'condition.not': conditionNotEditor as any,
    'condition.required': conditionRequiredEditor as any,
    'field.checkbox': fieldCheckboxEditor as any,
    'field.number': fieldNumberEditor as any,
    'field.text': fieldTextEditor as any,
    'field.button-radio-group': fieldButtonRadioGroupEditor as any,
    'helper.if': helperIfEditor as any,
    'helper.join': helperJoinEditor as any,
    'view.list': viewListEditor as any,
    'view.text': viewTextEditor as any,
    'field.checkbox-group': feildCheckboxGroupEditor as any
};

describe('output validation generator', () => {
    it('should generate data schema', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'field.number',
                        data: {
                            type: 'data.output',
                            path: 'some.path'
                        }
                    },
                    {
                        type: 'field.number',
                        data: {
                            type: 'data.output',
                            path: 'another.path'
                        }
                    }
                ]
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            additionalProperties: false,
            properties: {
                some: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        path: {
                            type: 'number'
                        }
                    }
                },
                another: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        path: {
                            type: 'number'
                        }
                    }
                }
            }
        });
    });
    it('should allow additional properties when getters used as data path', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'field.number',
                        data: {
                            type: 'data.output',
                            path: 'some.path'
                        }
                    },
                    {
                        type: 'field.number',
                        data: {
                            type: 'data.output',
                            path: {
                                type: 'helper.join',
                                items: ['path']
                            }
                        }
                    },
                    {
                        type: 'field.number',
                        data: {
                            type: 'data.output',
                            path: 'another.path'
                        }
                    }
                ]
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            additionalProperties: true,
            properties: {
                some: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                        path: {
                            type: 'number'
                        }
                    }
                },
                another: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                        path: {
                            type: 'number'
                        }
                    }
                }
            }
        });
    });
    it('should set required for deep properties', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'field.number',
                        data: {
                            type: 'data.output',
                            path: 'some.unknown.very.deep.path'
                        }
                    },
                    {
                        type: 'field.number',
                        data: {
                            type: 'data.output',
                            path: 'some.unknown.another.very.deep.path'
                        },
                        validation: {
                            type: 'condition.required'
                        }
                    }
                ]
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            required: ['some'],
            additionalProperties: false,
            properties: {
                some: {
                    type: 'object',
                    required: ['unknown'],
                    additionalProperties: false,
                    properties: {
                        unknown: {
                            type: 'object',
                            required: ['another'],
                            additionalProperties: false,
                            properties: {
                                very: {
                                    type: 'object',
                                    additionalProperties: false,
                                    properties: {
                                        deep: {
                                            type: 'object',
                                            additionalProperties: false,
                                            properties: {
                                                path: {
                                                    type: 'number'
                                                }
                                            }
                                        }
                                    }
                                },
                                another: {
                                    type: 'object',
                                    required: ['very'],
                                    additionalProperties: false,
                                    properties: {
                                        very: {
                                            type: 'object',
                                            required: ['deep'],
                                            additionalProperties: false,
                                            properties: {
                                                deep: {
                                                    type: 'object',
                                                    required: ['path'],
                                                    additionalProperties: false,
                                                    properties: {
                                                        path: {
                                                            type: 'number'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    });
    it('should not set required for conditional-rendered fields', async () => {
        const config = {
            view: {
                type: 'helper.if',
                condition: true,
                then: {
                    type: 'field.number',
                    data: {
                        type: 'data.output',
                        path: 'path'
                    },
                    validation: {
                        type: 'condition.required'
                    }
                }
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            additionalProperties: false,
            properties: {
                path: {
                    type: 'number'
                }
            }
        });
    });
    it('should not set required for conditional-used conditions', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'field.checkbox',
                        label: 'Label',
                        data: {
                            type: 'data.output',
                            path: 'path1'
                        }
                    },
                    {
                        type: 'field.text',
                        label: 'Text',
                        placeholder: 'Noting typed there...',
                        data: {
                            type: 'data.output',
                            path: 'path2'
                        },
                        validation: {
                            type: 'helper.if',
                            condition: {
                                type: 'condition.equals',
                                data: {
                                    type: 'data.output',
                                    path: 'path1'
                                },
                                to: true
                            },
                            then: {
                                type: 'condition.required'
                            }
                        }
                    }
                ]
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            additionalProperties: false,
            properties: {
                path1: { type: 'boolean' },
                path2: { type: 'string' }
            }
        });
    });
    it('should take data-types from some conditions', async () => {
        const config = {
            view: {
                type: 'helper.if',
                condition: true,
                then: {
                    type: 'field.number',
                    data: {
                        type: 'data.output',
                        path: 'path'
                    },
                    validation: {
                        type: 'condition.more',
                        then: 10
                    }
                }
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            additionalProperties: false,
            properties: {
                path: {
                    anyOf: [
                        {
                            type: 'number',
                            exclusiveMinimum: 10
                        },
                        {
                            type: 'number'
                        }
                    ]
                }
            }
        });
    });
    it('should handle multiple conditions', async () => {
        const config = {
            view: {
                type: 'field.number',
                data: {
                    type: 'data.output',
                    path: 'path'
                },
                validation: {
                    type: 'condition.all',
                    conditions: [
                        {
                            type: 'condition.more',
                            then: 10
                        },
                        {
                            type: 'condition.required'
                        }
                    ]
                }
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            required: ['path'],
            additionalProperties: false,
            properties: {
                path: {
                    anyOf: [
                        {
                            // from condtion
                            allOf: [
                                {
                                    type: 'number',
                                    exclusiveMinimum: 10
                                },
                                true
                            ]
                        },
                        {
                            // from field
                            type: 'number'
                        }
                    ]
                }
            }
        });
    });
    it('should validate views', async () => {
        const config = {
            view: {
                type: 'view.text',
                content: 'Hello world',
                validation: {
                    type: 'condition.required',
                    data: {
                        type: 'data.output',
                        path: 'path'
                    }
                }
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            required: ['path'],
            additionalProperties: false,
            properties: {
                path: true
            }
        });
    });
    it('should do not change schema data if not specified inside of field', async () => {
        const config = {
            view: {
                type: 'view.text',
                content: 'Hello world',
                validation: {
                    type: 'condition.required'
                }
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({ type: 'object' });
    });
    it('should handle not-composing', async () => {
        const config = {
            view: {
                type: 'field.number',
                data: {
                    type: 'data.output',
                    path: 'path'
                },
                validation: {
                    type: 'condition.not',
                    condition: {
                        type: 'condition.required'
                    }
                }
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            properties: { path: { anyOf: [{ not: true }, { type: 'number' }] } },
            additionalProperties: false
        });
    });
});
describe('input validation generator', () => {
    it('should handle data.input', async () => {
        const config = {
            view: {
                type: 'view.text',
                content: {
                    type: 'data.input',
                    path: 'path'
                }
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.input).toEqual({
            type: 'object',
            properties: { path: true },
            required: ['path'],
            additionalProperties: false
        });
    });
    it('should extract primitive types from input example', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'view.text',
                        content: {
                            type: 'data.input',
                            path: 'path1'
                        }
                    },
                    {
                        type: 'view.text',
                        content: {
                            type: 'data.input',
                            path: 'path2'
                        }
                    },
                    {
                        type: 'view.text',
                        content: {
                            type: 'data.input',
                            path: 'path3'
                        }
                    }
                ]
            }
        };
        const inputExample = {
            path1: 'Hello world',
            path2: 42.2,
            path3: false
        };
        const validation = await getValidation(config, inputExample);

        expect(validation.schema.root.properties.input).toEqual({
            type: 'object',
            properties: {
                path1: { type: 'string' },
                path2: { type: 'number' },
                path3: { type: 'boolean' }
            },
            required: ['path1', 'path2', 'path3'],
            additionalProperties: false
        });
    });
    it('should not extract non-primitive types from input example', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'view.text',
                        content: {
                            type: 'data.input',
                            path: 'path'
                        }
                    }
                ]
            }
        };
        const inputExample = {
            path: {}
        };
        const validation = await getValidation(config, inputExample);

        expect(validation.schema.root.properties.input).toEqual({
            type: 'object',
            properties: {
                path: true
            },
            required: ['path'],
            additionalProperties: false
        });
    });
    it('should extract url specialType from input example', async () => {
        const config = {
            view: {
                type: 'view.text',
                content: {
                    type: 'data.input',
                    path: 'path'
                }
            }
        };
        const inputExample = {
            path: 'https://google.com'
        };
        const validation = await getValidation(config, inputExample);

        expect(validation.schema.root.properties.input).toEqual({
            type: 'object',
            properties: {
                path: { type: 'string', tbSpecialType: 'url' }
            },
            required: ['path'],
            additionalProperties: false
        });
    });
    it('should handle input example data, not used in data.input', async () => {
        const config = {
            view: {
                type: 'view.text',
                content: {
                    type: 'data.input',
                    path: 'path1'
                }
            }
        };
        const inputExample = {
            path2: 'https://google.com'
        };
        const validation = await getValidation(config, inputExample);

        expect(validation.schema.root.properties.input).toEqual({
            type: 'object',
            properties: {
                path1: true,
                path2: { type: 'string', tbSpecialType: 'url' }
            },
            required: ['path1'],
            additionalProperties: false
        });
    });
    it('should make data non-required if default provided', async () => {
        const config = {
            view: {
                type: 'view.text',
                content: {
                    type: 'data.input',
                    path: 'path',
                    default: 'default value'
                }
            }
        };
        const inputExample = {
            path: 'Hello world'
        };
        const validation = await getValidation(config, inputExample);

        expect(validation.schema.root.properties.input).toEqual({
            type: 'object',
            properties: {
                path: {
                    type: 'string'
                }
            },
            additionalProperties: false
        });
    });
    it('should add maybeInteger when input example is integer', async () => {
        const config = {
            view: {
                type: 'view.text',
                content: {
                    type: 'data.input',
                    path: 'age',
                    default: 'default value'
                }
            }
        };
        const inputExample = {
            age: 24
        };
        const validation = await getValidation(config, inputExample);

        expect(validation.schema.root.properties.input).toEqual({
            type: 'object',
            properties: {
                age: {
                    type: 'number',
                    tbSpecialType: 'maybeInteger'
                }
            },
            additionalProperties: false
        });
    });
    it('should add maybeInteger when input example is integer', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'field.button-radio-group',
                        label: 'Есть ли событие или происшествие?',
                        options: [
                            {
                                label: 'Значимое событие',
                                value: 'big_accidents'
                            },
                            {
                                label: 'Локальное событие',
                                value: 'local_accidents'
                            },
                            {
                                label: 'Не событие/происшествие',
                                value: 'ok'
                            },
                            {
                                label: 'Невозможно оценить',
                                value: 'unavailable'
                            }
                        ],
                        data: {
                            type: 'data.output',
                            path: 'result.0'
                        },
                        validation: {
                            type: 'condition.required'
                        }
                    },
                    {
                        type: 'field.button-radio-group',
                        label: 'Трагический ли сюжет?',
                        options: [
                            {
                                label: 'Трагический',
                                value: 'tragic'
                            },
                            {
                                label: 'Не трагический',
                                value: 'ok'
                            },
                            {
                                label: 'Невозможно оценить',
                                value: 'unavailable'
                            }
                        ],
                        data: {
                            type: 'data.output',
                            path: 'result.1'
                        },
                        validation: {
                            type: 'condition.required'
                        }
                    }
                ]
            }
        };
        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            properties: {
                result: {
                    type: 'array',
                    items: {
                        anyOf: [
                            {
                                type: 'string',
                                enum: ['big_accidents', 'local_accidents', 'ok', 'unavailable']
                            },
                            {
                                type: 'string',
                                enum: ['tragic', 'ok', 'unavailable']
                            }
                        ]
                    }
                }
            },
            required: ['result'],
            additionalProperties: false
        });
    });
    it('should handle empty paths as root spread', async () => {
        const config = {
            view: {
                type: 'field.checkbox-group',
                label: 'Заголовок',
                options: [
                    {
                        label: 'Опция 1',
                        value: 'value1'
                    },
                    {
                        label: 'Опция 2',
                        value: 'value2'
                    }
                ],
                data: {
                    type: 'data.output',
                    path: ''
                }
            }
        };

        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            properties: {
                value1: {
                    type: 'boolean'
                },
                value2: {
                    type: 'boolean'
                }
            }
        });
    });
    it('should not extend schema ignoring anyOf', async () => {
        const config = {
            view: {
                type: 'view.list',
                items: [
                    {
                        type: 'field.checkbox-group',
                        label: 'Заголовок',
                        options: [
                            {
                                label: 'Опция 1',
                                value: 'value1'
                            },
                            {
                                label: 'Опция 2',
                                value: 'value2'
                            }
                        ],
                        data: {
                            type: 'data.output',
                            path: 'result'
                        }
                    },
                    {
                        type: 'field.checkbox',
                        label: 'Опция 3',
                        data: {
                            type: 'data.output',
                            path: 'result.value3'
                        }
                    }
                ]
            }
        };

        const validation = await getValidation(config, {});

        expect(validation.schema.root.properties.output).toEqual({
            type: 'object',
            properties: {
                result: {
                    anyOf: [
                        {
                            type: 'object',
                            properties: {
                                value3: true
                            },
                            additionalProperties: false
                        },
                        {
                            type: 'object',
                            properties: {
                                value1: {
                                    type: 'boolean'
                                },
                                value2: {
                                    type: 'boolean'
                                }
                            }
                            // no additionalProperties because this branch
                            // content is generated by the field.checkbox-group
                            // maybe add additionalProperties to field.checkbox-group
                            // output schema, but it's not critical
                        },
                        {
                            type: 'object',
                            properties: {
                                value3: {
                                    type: 'boolean'
                                }
                            },
                            additionalProperties: false
                        }
                    ]
                }
            },
            additionalProperties: false
        });
    });
});
