import { makeEmptyCtx } from './tbCtx';

describe('makeCtx', () => {
    it('should create context', () => {
        makeEmptyCtx();
    });
    it('should create context with input/output/internal properties', () => {
        const ctx = makeEmptyCtx();

        expect(ctx).toHaveProperty('input');
        expect(ctx).toHaveProperty('output');
        expect(ctx).toHaveProperty('internal');
    });
    it('should create context with config property', () => {
        const ctx = makeEmptyCtx();

        expect(ctx).toHaveProperty('config');
    });
});
