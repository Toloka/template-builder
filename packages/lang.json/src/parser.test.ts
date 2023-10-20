import { parseJSON } from './parser';

/* eslint-disable max-nested-callbacks */

describe('editor', () => {
    describe('parse', () => {
        describe('primitives', () => {
            it('parses null', () => {
                const { value, meta } = parseJSON('null');

                expect(meta.errors.length).toBe(0);
                expect(value).toEqual({
                    type: 'null',
                    from: 0,
                    to: 4
                });
            });

            it('parses numbers', () => {
                const { value: oneValue, meta: oneMeta } = parseJSON('1');

                expect(oneMeta.errors.length).toBe(0);
                expect(oneValue).toEqual({
                    type: 'number',
                    value: 1,
                    from: 0,
                    to: 1
                });

                const { value: zeroValue, meta: zeroMeta } = parseJSON('0');

                expect(zeroMeta.errors.length).toBe(0);
                expect(zeroValue).toEqual({
                    type: 'number',
                    value: 0,
                    from: 0,
                    to: 1
                });

                const { value: float0Value, meta: float0Meta } = parseJSON('0.123');

                expect(float0Meta.errors.length).toBe(0);
                expect(float0Value).toEqual({
                    type: 'number',
                    value: 0.123,
                    from: 0,
                    to: 5
                });

                const { value: floatValue, meta: floatMeta } = parseJSON('123.123');

                expect(floatMeta.errors.length).toBe(0);
                expect(floatValue).toEqual({
                    type: 'number',
                    value: 123.123,
                    from: 0,
                    to: 7
                });
            });

            it('parses strings', () => {
                const { value: strValue, meta: strMeta } = parseJSON('"str"');

                expect(strMeta.errors.length).toBe(0);
                expect(strValue).toEqual({
                    type: 'string',
                    value: 'str',
                    from: 0,
                    to: 5
                });

                const { value: escapedValue, meta: escapedMeta } = parseJSON('"s\\"\\"\\"   ,;:[{tr"');

                expect(escapedMeta.errors.length).toBe(0);
                expect(escapedValue).toEqual({
                    type: 'string',
                    value: 's"""   ,;:[{tr',
                    from: 0,
                    to: 19
                });
            });

            it('parses booleans', () => {
                const { value: trueValue, meta: trueMeta } = parseJSON('true');

                expect(trueMeta.errors.length).toBe(0);
                expect(trueValue).toEqual({
                    type: 'boolean',
                    value: true,
                    from: 0,
                    to: 4
                });

                const { value: falseValue, meta: falseMeta } = parseJSON('false');

                expect(falseMeta.errors.length).toBe(0);
                expect(falseValue).toEqual({
                    type: 'boolean',
                    value: false,
                    from: 0,
                    to: 5
                });
            });
        });

        describe('arrays', () => {
            it('parses empty arrays', () => {
                const { value, meta } = parseJSON('[]');

                expect(meta.errors.length).toBe(0);
                expect(value).toEqual({
                    type: 'array',
                    items: [],
                    from: 0,
                    to: 2
                });
            });

            it('parses array of numbers', () => {
                const { value, meta } = parseJSON('[1, 2, 3]');

                expect(meta.errors.length).toBe(0);
                expect(value).toMatchObject({
                    type: 'array',
                    items: [
                        { type: 'number', value: 1, from: 1, to: 2 },
                        { type: 'number', value: 2, from: 4, to: 5 },
                        { type: 'number', value: 3, from: 7, to: 8 }
                    ],
                    from: 0,
                    to: 9
                });
            });

            it('parses array of strings', () => {
                const { value, meta } = parseJSON('["a", "2"]');

                expect(meta.errors.length).toBe(0);
                expect(value).toMatchObject({
                    type: 'array',
                    items: [
                        { type: 'string', value: 'a', from: 1, to: 4 },
                        { type: 'string', value: '2', from: 6, to: 9 }
                    ],
                    from: 0,
                    to: 10
                });
            });

            it('parses array regardless of whitespace', () => {
                const result = [
                    { type: 'boolean', value: false },
                    { type: 'boolean', value: true }
                ];

                const syntax = [
                    parseJSON('[false, true]'),
                    parseJSON('[ false , true]'),
                    parseJSON('[false,true]'),
                    parseJSON('[false ,true]'),
                    parseJSON('[false , true]'),
                    parseJSON('[ false , true ]'),
                    parseJSON('[ false,true ]'),
                    parseJSON('[ false, true ]'),
                    parseJSON('[ false,true]'),
                    parseJSON('[ false,\ntrue]'),
                    parseJSON('[\nfalse,\ntrue\n]'),
                    parseJSON('[\n\tfalse,\t\ntrue\t\n\t]')
                ];

                syntax.forEach(({ value, meta }) => {
                    expect(meta.errors.length).toBe(0);
                    if (value && value.type === 'array') {
                        expect(value.items[0]).toMatchObject(result[0]);
                        expect(value.items[1]).toMatchObject(result[1]);
                    } else {
                        expect(value ? value.type : undefined).toBe('array');
                    }
                });
            });

            it('parses nested arrays', () => {
                const { value, meta } = parseJSON('[1, ["wow so", [1337]], 3]');

                expect(meta.errors.length).toBe(0);
                expect(value).toMatchObject({
                    type: 'array',
                    items: [
                        {
                            type: 'number',
                            value: 1,
                            from: 1,
                            to: 2
                        },
                        {
                            type: 'array',
                            items: [
                                {
                                    type: 'string',
                                    value: 'wow so',
                                    from: 5,
                                    to: 13
                                },
                                {
                                    type: 'array',
                                    items: [
                                        {
                                            type: 'number',
                                            value: 1337,
                                            from: 16,
                                            to: 20
                                        }
                                    ],
                                    from: 15,
                                    to: 21
                                }
                            ],
                            from: 4,
                            to: 22
                        },
                        {
                            type: 'number',
                            value: 3,
                            from: 24,
                            to: 25
                        }
                    ],
                    from: 0,
                    to: 26
                });
            });

            it('parses hanging arrays', () => {
                const { value, meta } = parseJSON('[1, 2');

                expect(meta.errors).toContainEqual({
                    error: 'error.array.not_closed',
                    from: 5,
                    to: 6,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'array',
                    items: [
                        { type: 'number', value: 1, from: 1, to: 2 },
                        { type: 'number', value: 2, from: 4, to: 5 }
                    ],
                    from: 0,
                    to: 5
                });
            });

            it('parses arrays with excessive comma', () => {
                const { value, meta } = parseJSON('[1,,3]');

                expect(meta.errors).toContainEqual({
                    type: 'error',
                    error: 'error.array.excess_comma',
                    from: 3,
                    to: 4
                });
                expect(value).toEqual({
                    type: 'array',
                    items: [
                        { type: 'number', value: 1, from: 1, to: 2 },
                        { type: 'missing', from: 3, to: 4 },
                        { type: 'number', value: 3, from: 4, to: 5 }
                    ],
                    from: 0,
                    to: 6
                });
            });

            it('parses arrays with missing comma', () => {
                const { value, meta } = parseJSON('[1 2]');

                expect(meta.errors).toContainEqual({
                    error: 'error.array.missing_comma',
                    from: 2,
                    to: 3,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'array',
                    items: [
                        { type: 'number', value: 1, from: 1, to: 2 },
                        { type: 'number', value: 2, from: 3, to: 4 }
                    ],
                    from: 0,
                    to: 5
                });
            });

            it('parses arrays with trailing comma', () => {
                const { value, meta } = parseJSON('[1, 2,]');

                expect(meta.errors).toContainEqual({
                    error: 'error.array.trailing_comma',
                    from: 5,
                    to: 6,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'array',
                    items: [
                        { type: 'number', value: 1, from: 1, to: 2 },
                        { type: 'number', value: 2, from: 4, to: 5 },
                        { type: 'missing', from: 5, to: 6 }
                    ],
                    from: 0,
                    to: 7
                });
            });
        });

        describe('objects', () => {
            it('parses empty objects', () => {
                const { value, meta } = parseJSON('{}');

                expect(meta.errors.length).toBe(0);
                expect(value).toEqual({
                    type: 'object',
                    props: [],
                    from: 0,
                    to: 2
                });
            });

            it('parses objects', () => {
                const { value, meta } = parseJSON('{"key": "value", "num": 42}');

                expect(meta.errors.length).toBe(0);
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'key', from: 1, to: 6, owner: expect.anything() },
                            value: { type: 'string', value: 'value', from: 8, to: 15 },
                            from: 1,
                            to: 15
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'num', from: 17, to: 22, owner: expect.anything() },
                            value: { type: 'number', value: 42, from: 24, to: 26 },
                            from: 17,
                            to: 26
                        }
                    ],
                    from: 0,
                    to: 27
                });
            });

            it('parses nested objects', () => {
                const { value, meta } = parseJSON('{"key": "value", "obj": {"num": 42}, "str": "meow", "null": null}');

                expect(meta.errors.length).toBe(0);
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: {
                                type: 'key',
                                owner: expect.anything(),
                                value: 'key',
                                from: 1,
                                to: 6
                            },
                            value: {
                                type: 'string',
                                value: 'value',
                                from: 8,
                                to: 15
                            },
                            from: 1,
                            to: 15
                        },
                        {
                            type: 'prop',
                            key: {
                                type: 'key',
                                owner: expect.anything(),
                                value: 'obj',
                                from: 17,
                                to: 22
                            },
                            value: {
                                type: 'object',
                                props: [
                                    {
                                        type: 'prop',
                                        key: {
                                            type: 'key',
                                            owner: expect.anything(),
                                            value: 'num',
                                            from: 25,
                                            to: 30
                                        },
                                        value: {
                                            type: 'number',
                                            value: 42,
                                            from: 32,
                                            to: 34
                                        },
                                        from: 25,
                                        to: 34
                                    }
                                ],
                                from: 24,
                                to: 35
                            },
                            from: 17,
                            to: 35
                        },
                        {
                            type: 'prop',
                            key: {
                                type: 'key',
                                owner: expect.anything(),
                                value: 'str',
                                from: 37,
                                to: 42
                            },
                            value: {
                                type: 'string',
                                value: 'meow',
                                from: 44,
                                to: 50
                            },
                            from: 37,
                            to: 50
                        },
                        {
                            type: 'prop',
                            key: {
                                type: 'key',
                                owner: expect.anything(),
                                value: 'null',
                                from: 52,
                                to: 58
                            },
                            value: {
                                type: 'null',
                                from: 60,
                                to: 64
                            },
                            from: 52,
                            to: 64
                        }
                    ],
                    from: 0,
                    to: 65
                });
            });

            it('parses objects with missing comma', () => {
                const { value, meta } = parseJSON('{"key": "value" "num": 42}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_comma',
                    from: 15,
                    to: 16,
                    type: 'error'
                });

                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'key', from: 1, to: 6 },
                            value: { type: 'string', value: 'value', from: 8, to: 15 },
                            from: 1,
                            to: 15
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'num', from: 16, to: 21 },
                            value: { type: 'number', value: 42, from: 23, to: 25 },
                            from: 16,
                            to: 25
                        }
                    ],
                    from: 0,
                    to: 26
                });
            });

            it('parses objects with excessive comma', () => {
                const { value, meta } = parseJSON('{"key": "value",, "num": 42}');

                expect(meta.errors).toContainEqual({
                    type: 'error',
                    error: 'error.object.excess_comma',
                    from: 16,
                    to: 17
                });

                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'key', from: 1, to: 6 },
                            value: { type: 'string', value: 'value', from: 8, to: 15 },
                            from: 1,
                            to: 15
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'num', from: 18, to: 23 },
                            value: { type: 'number', value: 42, from: 25, to: 27 },
                            from: 18,
                            to: 27
                        }
                    ],
                    from: 0,
                    to: 28
                });
            });

            it('parses objects with trailing comma', () => {
                const { value, meta } = parseJSON('{"key": "value", "num": 42,}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.trailing_comma',
                    from: 26,
                    to: 27,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'key', from: 1, to: 6 },
                            value: { type: 'string', value: 'value', from: 8, to: 15 },
                            from: 1,
                            to: 15
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'num', from: 17, to: 22 },
                            value: { type: 'number', value: 42, from: 24, to: 26 },
                            from: 17,
                            to: 26
                        }
                    ],
                    from: 0,
                    to: 28
                });
            });

            it('parses objects with missing keys', () => {
                const { value, meta } = parseJSON('{"key": "value", : 42}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_key',
                    from: 16,
                    to: 17,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'key', from: 1, to: 6 },
                            value: { type: 'string', value: 'value', from: 8, to: 15 },
                            from: 1,
                            to: 15
                        },
                        {
                            type: 'prop',
                            key: {
                                from: 17,
                                to: 18,
                                type: 'missing'
                            },
                            value: { type: 'number', value: 42, from: 19, to: 21 },
                            from: 17,
                            to: 21
                        }
                    ],
                    from: 0,
                    to: 22
                });
            });

            it('parses objects with missing first keys', () => {
                const { value, meta } = parseJSON('{: "value", "num": 42}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_key',
                    from: 0,
                    to: 1,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: {
                                from: 1,
                                to: 2,
                                type: 'missing'
                            },
                            value: { type: 'string', value: 'value', from: 3, to: 10 },
                            from: 1,
                            to: 10
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'num', from: 12, to: 17 },
                            value: { type: 'number', value: 42, from: 19, to: 21 },
                            from: 12,
                            to: 21
                        }
                    ],
                    from: 0,
                    to: 22
                });
            });

            it('parses objects with unquoted keys', () => {
                const { value, meta } = parseJSON('{key: "value", num: 42}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.unquoted_key',
                    from: 1,
                    to: 4,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'key', from: 1, to: 4 },
                            value: { type: 'string', value: 'value', from: 6, to: 13 },
                            from: 1,
                            to: 13
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'num', from: 15, to: 18 },
                            value: { type: 'number', value: 42, from: 20, to: 22 },
                            from: 15,
                            to: 22
                        }
                    ],
                    from: 0,
                    to: 23
                });
            });

            it('parses objects with missing colon', () => {
                const { value, meta } = parseJSON('{"key" "value", "num": 42}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_colon',
                    from: 6,
                    to: 7,
                    type: 'error'
                });
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'key', from: 1, to: 6 },
                            value: { type: 'string', value: 'value', from: 7, to: 14 },
                            from: 1,
                            to: 14
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', owner: expect.anything(), value: 'num', from: 16, to: 21 },
                            value: { type: 'number', value: 42, from: 23, to: 25 },
                            from: 16,
                            to: 25
                        }
                    ],
                    from: 0,
                    to: 26
                });
            });

            it('parses objects with missing value', () => {
                const { value, meta } = parseJSON('{"key": , "num": 42}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_value',
                    from: 7,
                    to: 7,
                    type: 'error'
                });

                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'key', from: 1, to: 6, owner: expect.anything() },
                            value: {
                                from: 7,
                                to: 7,
                                type: 'missing'
                            },
                            from: 1,
                            to: 8
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'num', from: 10, to: 15, owner: expect.anything() },
                            value: { type: 'number', value: 42, from: 17, to: 19 },
                            from: 10,
                            to: 19
                        }
                    ],
                    from: 0,
                    to: 20
                });
            });

            it('parses objects with missing last value', () => {
                const { value, meta } = parseJSON('{"key": "value", "num":}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_value',
                    from: 23,
                    to: 23,
                    type: 'error'
                });

                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'key', from: 1, to: 6, owner: expect.anything() },
                            value: { type: 'string', value: 'value', from: 8, to: 15 },
                            from: 1,
                            to: 15
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'num', from: 17, to: 22, owner: expect.anything() },
                            value: { type: 'missing', from: 23, to: 23 },
                            from: 17,
                            to: 23
                        }
                    ],
                    from: 0,
                    to: 24
                });
            });

            it('parses objects with missing value and no comma', () => {
                const { value, meta } = parseJSON('{\n"view": \n}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_value',
                    from: 9,
                    to: 10,
                    type: 'error'
                });

                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'view', from: 2, to: 8, owner: expect.anything() },
                            value: {
                                from: 9,
                                to: 10,
                                type: 'missing'
                            },
                            from: 2,
                            to: 10
                        }
                    ],
                    from: 0,
                    to: 12
                });
            });

            it('parses objects with missing value and no comma before next prop', () => {
                const { value, meta } = parseJSON('{\n"view": \n"plugins": []}');

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_value',
                    from: 9,
                    to: 10,
                    type: 'error'
                });

                expect(meta.errors).toContainEqual({
                    error: 'error.object.missing_comma',
                    from: 10,
                    to: 11,
                    type: 'error'
                });

                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'view', from: 2, to: 8, owner: expect.anything() },
                            value: {
                                type: 'missing',
                                from: 9,
                                to: 10
                            },
                            from: 2,
                            to: 10
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'plugins', from: 11, to: 20, owner: expect.anything() },
                            value: {
                                type: 'array',
                                from: 22,
                                to: 24,
                                items: []
                            },
                            from: 11,
                            to: 24
                        }
                    ],
                    from: 0,
                    to: 25
                });
            });

            it('parses objects and arrays ignoring line breaks', () => {
                const { value, meta } = parseJSON(`{"arrayProp":
                [
                ], "objectProp":
                    {
                    }
                }`);

                expect(meta.errors.length).toBe(0);
                expect(value).toEqual({
                    type: 'object',
                    props: [
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'arrayProp', from: 1, to: 12, owner: expect.anything() },
                            value: { type: 'array', items: [], from: 30, to: 49 },
                            from: 1,
                            to: 49
                        },
                        {
                            type: 'prop',
                            key: { type: 'key', value: 'objectProp', from: 51, to: 63, owner: expect.anything() },
                            value: { type: 'object', props: [], from: 85, to: 108 },
                            from: 51,
                            to: 108
                        }
                    ],
                    from: 0,
                    to: 126
                });
            });
        });

        it('Throws error on multiple root values', () => {
            expect(parseJSON(`{"key":12} {}`).meta.errors).toEqual([
                { type: 'error', from: 10, to: 13, error: 'error.multiple_roots' }
            ]);
            expect(parseJSON(`12 25`).meta.errors).toEqual([
                { type: 'error', from: 2, to: 5, error: 'error.multiple_roots' }
            ]);
            expect(parseJSON(`{"key":12} []`).meta.errors).toEqual([
                { type: 'error', from: 10, to: 13, error: 'error.multiple_roots' }
            ]);
            expect(parseJSON(`"string" {"key":12}`).meta.errors).toEqual([
                { type: 'error', from: 8, to: 19, error: 'error.multiple_roots' }
            ]);
        });
    });
});
