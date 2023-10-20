/* eslint-disable max-nested-callbacks */
import { JSONSchema7Definition } from 'json-schema';

import { schema2tolokaDataSpec } from './schema2toloka';

const numProps = {
    minimum: 1,
    maximum: 100
};

const schema: JSONSchema7Definition = {
    type: 'object',
    properties: {
        name: {
            type: 'string'
        },
        gender: {
            type: 'string',
            enum: ['male', 'female'],
            minLength: 3,
            maxLength: 10
        },
        age: {
            type: 'number',
            ...numProps,
            enum: [18, 30]
        },
        staffCount: {
            type: 'number',
            tbSpecialType: 'maybeInteger'
        } as JSONSchema7Definition,
        attrs: {
            type: 'object'
        },
        arms: {
            type: 'integer',
            ...numProps,
            enum: [1, 2]
        },
        kids: {
            type: 'array',
            items: {
                type: 'string'
            },
            maxItems: 10,
            minItems: 0
        },
        pens: {
            type: 'array',
            items: {
                type: 'number',
                enum: [0.3, 0.5, 0.7]
            },
            minItems: 1
        },
        cats: {
            allOf: [
                {
                    type: 'number',
                    enum: [1, 2, 3]
                },
                {
                    type: 'number',
                    enum: [2, 3, 4, 5]
                }
            ]
        },
        vampires: {
            oneOf: [
                {
                    type: 'number',
                    enum: [1, 2, 3]
                },
                {
                    type: 'number',
                    enum: [2, 3, 4, 5]
                }
            ]
        },
        dogs: {
            anyOf: [
                {
                    type: 'number',
                    enum: [1, 2]
                },
                {
                    type: 'number',
                    enum: [3, 4]
                }
            ]
        },
        monsters: {
            anyOf: [
                {
                    type: 'string', // <--- different type
                    enum: ['1', '2']
                },
                {
                    type: 'number',
                    enum: [3, 4]
                }
            ]
        },
        birds: {
            anyOf: [
                {
                    anyOf: [
                        {
                            anyOf: [
                                {
                                    type: 'number',
                                    enum: [1, 2]
                                },
                                {
                                    type: 'number',
                                    enum: [3, 4]
                                }
                            ]
                        },
                        {
                            type: 'number',
                            enum: [3, 4]
                        }
                    ]
                },
                {
                    type: 'number',
                    enum: [3, 4]
                }
            ]
        },
        tolokers: {
            anyOf: [
                {
                    type: 'number',
                    enum: [1, 2],
                    tbSpecialType: 'maybeInteger'
                } as JSONSchema7Definition,
                {
                    type: 'number',
                    enum: [3, 4],
                    tbSpecialType: 'maybeInteger'
                } as JSONSchema7Definition
            ]
        }
    },

    required: ['name', 'arms']
};

describe('toloka export', () => {
    describe('validation', () => {
        it('returns issues if there is no validation', () => {
            expect(schema2tolokaDataSpec(undefined).issues.length).toBeGreaterThan(0);
            expect(schema2tolokaDataSpec(true).issues.length).toBeGreaterThan(0);
        });

        it('returns issues if root type isn`t object', () => {
            expect(schema2tolokaDataSpec({ type: 'string' }).issues.length).toBeGreaterThan(0);
            expect(schema2tolokaDataSpec({ type: 'number' }).issues.length).toBeGreaterThan(0);
        });

        it('returns issues if there are no properties', () => {
            expect(schema2tolokaDataSpec({ type: 'object' }).issues.length).toBeGreaterThan(0);
            expect(schema2tolokaDataSpec({ type: 'object', properties: {} }).issues.length).toBeGreaterThan(0);
        });

        it('maps property types correctly', () => {
            const mapped = schema2tolokaDataSpec(schema);

            expect(Object.keys(mapped.spec)).toEqual(Object.keys(schema.properties as any));
            expect(mapped.spec.name.type).toBe('string');
            expect(mapped.spec.age.type).toBe('float');
            expect(mapped.spec.attrs.type).toBe('json');
            expect(mapped.spec.arms.type).toBe('integer');
        });

        it('respects required', () => {
            const mapped = schema2tolokaDataSpec(schema);

            expect(mapped.spec.name.required).toBe(true);
            expect(mapped.spec.arms.required).toBe(true);
            expect(mapped.spec.age.required).toBeFalsy();
            expect(mapped.spec.attrs.required).toBeFalsy();
        });

        it('belives to maybeInteger', () => {
            const mapped = schema2tolokaDataSpec(schema);

            expect(mapped.spec.staffCount.type).toBe('integer');
        });

        it('respects arrays', () => {
            const mapped = schema2tolokaDataSpec(schema);

            expect(mapped.spec.kids.type).toBe('array_string');
            expect(mapped.spec.pens.type).toBe('array_float');
        });

        it('maps strings correctly', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.gender.allowed_values).toEqual(['male', 'female']);
            expect(mapped.spec.gender.min_length).toEqual(3);
            expect(mapped.spec.gender.max_length).toEqual(10);
        });

        it('maps numbers correctly', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.arms.allowed_values).toEqual([1, 2]);
            expect(mapped.spec.arms.min_value).toEqual(1);
            expect(mapped.spec.arms.max_value).toEqual(100);

            expect(mapped.spec.age.allowed_values).toEqual([18, 30]);
            expect(mapped.spec.age.min_value).toEqual(1);
            expect(mapped.spec.age.max_value).toEqual(100);
        });

        it('maps array params', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.kids.min_size).toEqual(0);
            expect(mapped.spec.kids.max_size).toEqual(10);

            expect(mapped.spec.pens.allowed_values).toEqual([0.3, 0.5, 0.7]);
            expect(mapped.spec.pens.min_size).toEqual(1);
        });

        it('merges allOf', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.cats.allowed_values).toEqual([2, 3]);
        });

        it('takes first of oneOf', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.vampires.allowed_values).toEqual([1, 2, 3]);
        });

        it('merges anyOf', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.dogs.allowed_values).toEqual([1, 2, 3, 4]);
            expect(mapped.spec.dogs.type).toEqual('float');
        });

        it('returns json for nonoverlapping anyOf', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.monsters.type).toEqual('json');
        });

        it('merges nesteed anyOf', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.birds.allowed_values).toEqual([1, 2, 3, 4]);
            expect(mapped.spec.birds.type).toEqual('float');
        });

        it('preserves tbSpecialType on merge', () => {
            const mapped = schema2tolokaDataSpec(schema) as any;

            expect(mapped.spec.tolokers.type).toEqual('integer');
        });

        it('merges root branches', () => {
            const mapped = schema2tolokaDataSpec({
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            value1: { type: 'boolean' },
                            value2: { type: 'boolean' }
                        }
                    },
                    {
                        type: 'object',
                        properties: {
                            value3: { type: 'boolean' },
                            value4: { type: 'boolean' }
                        }
                    }
                ]
            }) as any;

            expect(mapped.spec).toEqual({
                value1: { type: 'boolean', required: false },
                value2: { type: 'boolean', required: false },
                value3: { type: 'boolean', required: false },
                value4: { type: 'boolean', required: false }
            });
        });
    });
});
