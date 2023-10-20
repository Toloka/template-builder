import * as core from '@toloka-tb/core';
import { compile } from '@toloka-tb/core/compileConfig/compileConfig';
import { makeCtxBag } from '@toloka-tb/core/ctx/ctxBag';
import { makeEmptyCtx } from '@toloka-tb/core/ctx/tbCtx';

import * as conditionSchema from './condition.schema';
const fullSource: any = { view: {} };

core.register(conditionSchema.create(core));

const schema = {
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
};

describe('condition.schema', () => {
    it('should return true when data is valid', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 200
        };
        const condition = compile({ source: schema, fullSource }, '', {
            usedTypes: new Set(),
            translations: {},
            locales: ['en']
        });

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();
    });
    it('should return false when data is invalid', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 404
        };
        const condition = compile({ source: schema, fullSource }, '', {
            usedTypes: new Set(),
            translations: {},
            locales: ['en']
        });

        expect(condition.get(makeCtxBag(ctx))).toBeFalsy();
    });
    it('should be reactive', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 200
        };
        const condition = compile({ source: schema, fullSource }, '', {
            usedTypes: new Set(),
            translations: {},
            locales: ['en']
        });

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();

        ctx.input = {
            code: 500
        };

        expect(condition.get(makeCtxBag(ctx))).toBeFalsy();
    });
});
