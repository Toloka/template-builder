import * as core from '@toloka-tb/core';
import { compile } from '@toloka-tb/core/compileConfig/compileConfig';
import { makeCtxBag } from '@toloka-tb/core/ctx/ctxBag';
import { makeEmptyCtx } from '@toloka-tb/core/ctx/tbCtx';

import * as less from './condition.less.ts';
const fullSource: any = { view: {} };

core.register(less.create(core));

describe('condition.less', () => {
    it('should return true when data is less then then', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 50
        };
        const condition = compile(
            {
                source: {
                    type: 'condition.less',
                    data: {
                        type: 'data.input',
                        path: 'code'
                    },
                    then: 100
                },
                fullSource
            },
            '',
            { usedTypes: new Set(), translations: {}, locales: ['en'] }
        );

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();
    });
    it('should return false when data is more then then', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 150
        };
        const condition = compile(
            {
                source: {
                    type: 'condition.less',
                    data: {
                        type: 'data.input',
                        path: 'code'
                    },
                    then: 100
                },
                fullSource
            },
            '',
            { usedTypes: new Set(), translations: {}, locales: ['en'] }
        );

        expect(condition.get(makeCtxBag(ctx))).toBeFalsy();
    });
    it('should return true when data is equal to then and orEqual=true', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 100
        };
        const condition = compile(
            {
                source: {
                    type: 'condition.less',
                    data: {
                        type: 'data.input',
                        path: 'code'
                    },
                    then: 100,
                    orEquals: true
                },
                fullSource
            },
            '',
            { usedTypes: new Set(), translations: {}, locales: ['en'] }
        );

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();
    });
});
