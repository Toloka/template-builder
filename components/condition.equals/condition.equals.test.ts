import * as core from '@toloka-tb/core';
import { compile } from '@toloka-tb/core/compileConfig/compileConfig';
import { makeCtxBag } from '@toloka-tb/core/ctx/ctxBag';
import { makeEmptyCtx } from '@toloka-tb/core/ctx/tbCtx';

import * as equals from './condition.equals';
const fullSource: any = { view: {} };

core.register(equals.create(core));

describe('condition.equals', () => {
    it('should return true when all items are equal', () => {
        const ctx = makeEmptyCtx();

        ctx.input = {
            message: "It's ok!"
        };
        const condition = compile(
            {
                source: {
                    type: 'condition.equals',
                    data: {
                        type: 'data.input',
                        path: 'message'
                    },
                    to: "It's ok!"
                },
                fullSource
            },
            '',
            { usedTypes: new Set(), translations: {}, locales: ['en'] }
        );

        expect(condition.get(makeCtxBag(ctx))).toBeTruthy();
    });
    it('should return false when items are different', () => {
        const ctx = makeEmptyCtx();

        const condition = compile(
            {
                source: {
                    type: 'condition.equals',
                    data: 1,
                    to: 2
                },
                fullSource
            },
            '',
            { usedTypes: new Set(), translations: {}, locales: ['en'] }
        );

        expect(condition.get(makeCtxBag(ctx))).toBeFalsy();
    });
});
