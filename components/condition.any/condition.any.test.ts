import * as conditionSchema from '@toloka-tb/condition.schema';
import * as core from '@toloka-tb/core';
import { compile } from '@toloka-tb/core/compileConfig/compileConfig';
import { makeCtxBag } from '@toloka-tb/core/ctx/ctxBag';
import { makeEmptyCtx } from '@toloka-tb/core/ctx/tbCtx';

import * as any from './condition.any';
const fullSource: any = { view: {} };

core.register(any.create(core));
core.register(conditionSchema.create(core));

const schema = {
    type: 'condition.any',
    conditions: [
        {
            type: 'condition.schema',
            data: {
                type: 'data.input',
                path: 'code'
            },
            schema: {
                type: 'number',
                minimum: 200,
                maximum: 299
            }
        },
        {
            type: 'condition.schema',
            data: {
                type: 'data.input',
                path: 'message'
            },
            schema: {
                type: 'string',
                minLength: 0
            }
        }
    ]
};

describe('condition.any', () => {
    it('should return true when all conditions are true', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 200,
            message: "It's ok!"
        };
        const condition = compile({ source: schema, fullSource }, '', {
            usedTypes: new Set(),
            translations: {},
            locales: ['en']
        });

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();
    });
    it('should return true when part of conditions are true', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 500,
            message: "It's not ok"
        };
        const condition = compile({ source: schema, fullSource }, '', {
            usedTypes: new Set(),
            translations: {},
            locales: ['en']
        });

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();
    });
    it('should return false when all conditions are false', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 500,
            meSSage: 'INTERNAL SERVER ERROR'
        };
        const condition = compile({ source: schema, fullSource }, '', {
            usedTypes: new Set(),
            translations: {},
            locales: ['en']
        });

        expect(condition.get(makeCtxBag(ctx))).toBeFalsy();
    });
});
