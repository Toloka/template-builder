import * as core from '@toloka-tb/core';
import { compile } from '@toloka-tb/core/compileConfig/compileConfig';
import { makeCtxBag } from '@toloka-tb/core/ctx/ctxBag';
import { makeEmptyCtx } from '@toloka-tb/core/ctx/tbCtx';

import * as more from './condition.more';
const fullSource: any = { view: {} };

core.register(more.create(core));

describe('condition.equals', () => {
    it('should return true when data is more then then', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 150 // data
        };
        const condition = compile(
            {
                source: {
                    type: 'condition.more',
                    data: {
                        type: 'data.input',
                        path: 'code'
                    },
                    then: 100 // then
                },
                fullSource
            },
            '',
            { usedTypes: new Set(), translations: {}, locales: ['en'] }
        );

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();
    });
    it('should return false when data is less then then', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            code: 50 // data
        };
        const condition = compile(
            {
                source: {
                    type: 'condition.more',
                    data: {
                        type: 'data.input',
                        path: 'code'
                    },
                    then: 100 // then
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
            code: 100 // data
        };
        const condition = compile(
            {
                source: {
                    type: 'condition.more',
                    data: {
                        type: 'data.input',
                        path: 'code'
                    },
                    then: 100, // then
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
