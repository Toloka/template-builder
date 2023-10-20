/* eslint-disable max-nested-callbacks */
import { helperHelper } from '../api/helpers/helper';
import { CtxBag, makeCtxBag } from '../ctx/ctxBag';
import { makeEmptyCtx } from '../ctx/tbCtx';
import { dataInput } from './input';
import { dataLocal } from './local';
import { dataRelative } from './relative';
import { dataInternal, dataOutput } from './rw';
import { dataSub } from './sub';

describe('core.data', () => {
    describe('data.input', () => {
        const makeGetter = <T>(cb: (bag: CtxBag) => T) => {
            return (helperHelper((_, bag) => cb(bag))({}) as any) as T;
        };

        let ctx = makeCtxBag(makeEmptyCtx());

        beforeEach(() => {
            ctx = makeCtxBag(makeEmptyCtx());
            ctx.tb.input = { pathVal: 123, pathKey: 'Val' };
        });

        it('queries ctx input', () => {
            const input = dataInput({ path: 'pathVal' });

            expect(input.get(ctx)).toBe(123);
        });

        it('supports getter paths', () => {
            const input = dataInput({ path: makeGetter(() => ['path', 'Val'].join('')) });

            expect(input.get(ctx)).toBe(123);
        });

        it('supports bag based getter paths', () => {
            const input = dataInput({ path: makeGetter((bag) => ['path', bag.tb.input.pathKey].join('')) });

            expect(input.get(ctx)).toBe(123);
        });

        it('supports default value', () => {
            const input = dataInput({ path: 'noPath', default: 'fallback' });

            expect(input.get(ctx)).toBe('fallback');
        });
    });

    // --------
    // rw
    // --------

    describe('data.output', () => {
        const makeGetter = <T>(cb: (bag: CtxBag) => T) => {
            return (helperHelper((_, bag) => cb(bag))({}) as any) as T;
        };

        let ctx = makeCtxBag(makeEmptyCtx());

        beforeEach(() => {
            ctx = makeCtxBag(makeEmptyCtx());
            ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
            ctx.tb.output.value = { val: 123 };
        });

        describe('static path', () => {
            const output = dataOutput({ path: 'val', default: 999 });

            it('gets', () => {
                expect(output.get(ctx)).toBe(123);
            });
            it('sets', () => {
                output.set(456, 'val', ctx);
                expect(output.get(ctx)).toBe(456);
                expect(ctx.tb.output.value.val).toBe(456);
            });
            it('providesProxy', () => {
                const proxy = output.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(output.get(ctx)).toBe(456);
                expect(ctx.tb.output.value.val).toBe(456);
            });
            it('returns default value', () => {
                expect(output.getDefault(ctx)).toBe(999);
            });
        });

        describe('getter path', () => {
            const output = dataOutput({
                path: makeGetter(() => ['v', 'a', 'l'].join('')),
                default: makeGetter(() => 999)
            });

            it('gets', () => {
                expect(output.get(ctx)).toBe(123);
            });
            it('sets', () => {
                output.set(456, 'val', ctx);
                expect(output.get(ctx)).toBe(456);
                expect(ctx.tb.output.value.val).toBe(456);
            });
            it('providesProxy', () => {
                const proxy = output.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(output.get(ctx)).toBe(456);
                expect(ctx.tb.output.value.val).toBe(456);
            });
            it('returns default value', () => {
                expect(output.getDefault(ctx)).toBe(999);
            });
        });

        describe('bag based getter path', () => {
            const output = dataOutput({
                path: makeGetter((bag) => bag.tb.input.pathKey),
                default: makeGetter((bag) => bag.tb.input.d)
            });

            it('gets', () => {
                expect(output.get(ctx)).toBe(123);
            });
            it('sets', () => {
                output.set(456, 'val', ctx);
                expect(output.get(ctx)).toBe(456);
                expect(ctx.tb.output.value.val).toBe(456);
            });
            it('providesProxy', () => {
                const proxy = output.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(output.get(ctx)).toBe(456);
                expect(ctx.tb.output.value.val).toBe(456);
            });
            it('returns default value', () => {
                expect(output.getDefault(ctx)).toBe(999);
            });
        });
    });

    describe('data.internal', () => {
        const makeGetter = <T>(cb: (bag: CtxBag) => T) => {
            return (helperHelper((_, bag) => cb(bag))({}) as any) as T;
        };

        let ctx = makeCtxBag(makeEmptyCtx());

        beforeEach(() => {
            ctx = makeCtxBag(makeEmptyCtx());
            ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999, nested: { sub: 123 } };
            ctx.tb.internal.value = { val: 123 };
        });

        describe('static path', () => {
            const internal = dataInternal({ path: 'val', default: 999 });

            it('gets', () => {
                expect(internal.get(ctx)).toBe(123);
            });
            it('sets', () => {
                internal.set(456, 'val', ctx);
                expect(internal.get(ctx)).toBe(456);
                expect(ctx.tb.internal.value.val).toBe(456);
            });
            it('providesProxy', () => {
                const proxy = internal.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(internal.get(ctx)).toBe(456);
                expect(ctx.tb.internal.value.val).toBe(456);
            });
            it('returns default value', () => {
                expect(internal.getDefault(ctx)).toBe(999);
            });
        });

        describe('getter path', () => {
            const internal = dataInternal({
                path: makeGetter(() => ['v', 'a', 'l'].join('')),
                default: makeGetter(() => 999)
            });

            it('gets', () => {
                expect(internal.get(ctx)).toBe(123);
            });
            it('sets', () => {
                internal.set(456, 'val', ctx);
                expect(internal.get(ctx)).toBe(456);
                expect(ctx.tb.internal.value.val).toBe(456);
            });
            it('providesProxy', () => {
                const proxy = internal.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(internal.get(ctx)).toBe(456);
                expect(ctx.tb.internal.value.val).toBe(456);
            });
            it('returns default value', () => {
                expect(internal.getDefault(ctx)).toBe(999);
            });
        });

        describe('bag based getter path', () => {
            const internal = dataInternal({
                path: makeGetter((bag) => bag.tb.input.pathKey),
                default: makeGetter((bag) => bag.tb.input.d)
            });

            it('gets', () => {
                expect(internal.get(ctx)).toBe(123);
            });
            it('sets', () => {
                internal.set(456, 'val', ctx);
                expect(internal.get(ctx)).toBe(456);
                expect(ctx.tb.internal.value.val).toBe(456);
            });
            it('providesProxy', () => {
                const proxy = internal.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(internal.get(ctx)).toBe(456);
                expect(ctx.tb.internal.value.val).toBe(456);
            });
            it('returns default value', () => {
                expect(internal.getDefault(ctx)).toBe(999);
            });
        });
    });

    // --------
    // sub
    // --------

    describe('data.sub', () => {
        const makeGetter = <T>(cb: (bag: CtxBag) => T) => {
            return (helperHelper((_, bag) => cb(bag))({}) as any) as T;
        };

        let ctx = makeCtxBag(makeEmptyCtx());

        beforeEach(() => {
            ctx = makeCtxBag(makeEmptyCtx());
            ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
            ctx.tb.output.value = {
                val: {
                    sub: 123
                }
            };
        });

        describe('static path, static parent', () => {
            const output = dataOutput<object>({ path: 'val' });
            const sub = dataSub({ parent: output, path: 'sub' });

            it('gets', () => {
                expect(sub.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = sub.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(sub.get(ctx)).toBe(456);
            });
        });

        describe('static path, dynamic parent', () => {
            const output = dataOutput<object>({
                path: makeGetter((bag) => bag.tb.input.pathKey)
            });
            const sub = dataSub({ parent: output, path: 'sub' });

            it('gets', () => {
                expect(sub.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = sub.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(sub.get(ctx)).toBe(456);
            });
        });

        describe('dynamic path, dynamic parent', () => {
            const output = dataOutput<object>({
                path: makeGetter((bag) => bag.tb.input.pathKey)
            });
            const sub = dataSub({ parent: output, path: makeGetter(() => ['s', 'u', 'b'].join('')) });

            it('gets', () => {
                expect(sub.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = sub.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(sub.get(ctx)).toBe(456);
                expect((ctx.tb.output.value.val as any).sub).toBe(456);
            });
        });

        describe('dynamic path, dynamic internal parent', () => {
            beforeEach(() => {
                ctx = makeCtxBag(makeEmptyCtx());
                ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
                ctx.tb.internal.value = {
                    val: {
                        sub: 123
                    }
                };
            });

            const output = dataInternal<object>({
                path: makeGetter((bag) => bag.tb.input.pathKey)
            });
            const sub = dataSub({ parent: output, path: makeGetter(() => ['s', 'u', 'b'].join('')) });

            it('gets', () => {
                expect(sub.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = sub.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(sub.get(ctx)).toBe(456);
                expect((ctx.tb.internal.value.val as any).sub).toBe(456);
            });
        });

        describe('dynamic path, nested', () => {
            beforeEach(() => {
                ctx = makeCtxBag(makeEmptyCtx());
                ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
                ctx.tb.internal.value = {
                    val: {
                        sub: {
                            sub: {
                                sub: 123
                            }
                        }
                    }
                };
            });

            const output = dataInternal<object>({
                path: makeGetter((bag) => bag.tb.input.pathKey)
            });
            const sub1 = dataSub({ parent: output, path: makeGetter(() => ['s', 'u', 'b'].join('')) });
            const sub2 = dataSub({ parent: sub1, path: makeGetter(() => ['s', 'u', 'b'].join('')) });
            const sub3 = dataSub({ parent: sub2, path: makeGetter(() => ['s', 'u', 'b'].join('')) });

            it('gets', () => {
                expect(sub3.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = sub3.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(sub3.get(ctx)).toBe(456);
                expect((ctx.tb.internal.value.val as any).sub.sub.sub).toBe(456);
            });
            it('reacts to parent change', () => {
                ctx.tb.internal.value.val = {
                    sub: {
                        sub: {
                            sub: 666
                        }
                    }
                };
                const proxy = sub3.makeProxy(ctx);

                expect(proxy.value).toBe(666);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(sub3.get(ctx)).toBe(456);
                expect((ctx.tb.internal.value.val as any).sub.sub.sub).toBe(456);
            });
        });
    });

    // --------
    // relative
    // --------

    describe('data.local', () => {
        const makeGetter = <T>(cb: (bag: CtxBag) => T) => {
            return (helperHelper((_, bag) => cb(bag))({}) as any) as T;
        };

        let ctx = makeCtxBag(makeEmptyCtx());

        beforeEach(() => {
            ctx = makeCtxBag(makeEmptyCtx());
            ctx.data.local = { pathVal: 123, pathKey: 'Val' };
        });

        it('queries ctx local data', () => {
            const local = dataLocal({ path: 'pathVal' });

            expect(local.get(ctx)).toBe(123);
        });

        it('supports getter paths', () => {
            const local = dataLocal({ path: makeGetter(() => ['path', 'Val'].join('')) });

            expect(local.get(ctx)).toBe(123);
        });

        it('supports bag based getter paths', () => {
            const local = dataLocal({ path: makeGetter((bag) => ['path', bag.data.local.pathKey].join('')) });

            expect(local.get(ctx)).toBe(123);
        });

        it('supports default value', () => {
            const local = dataLocal({ path: 'noPath', default: 'fallback' });

            expect(local.get(ctx)).toBe('fallback');
        });
    });

    describe('data.relative', () => {
        const makeGetter = <T>(cb: (bag: CtxBag) => T) => {
            return (helperHelper((_, bag) => cb(bag))({}) as any) as T;
        };

        let ctx = makeCtxBag(makeEmptyCtx());

        describe('empty path', () => {
            beforeEach(() => {
                ctx = makeCtxBag(makeEmptyCtx());
                ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
                ctx.tb.output.value = {
                    val: {
                        sub: 123,
                        sub2: 'magic'
                    }
                };
                const output = dataOutput<object>({
                    path: makeGetter((bag) => bag.tb.input.pathKey)
                });
                const sub = dataSub({ parent: output, path: makeGetter(() => ['s', 'u', 'b'].join('')) });

                ctx.data.relative.push(sub);
            });

            const relative = dataRelative({ path: '' });

            it('gets', () => {
                expect(relative.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = relative.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(relative.get(ctx)).toBe(456);
                expect((ctx.tb.output.value.val as any).sub).toBe(456);
            });
        });

        describe('static path', () => {
            beforeEach(() => {
                ctx = makeCtxBag(makeEmptyCtx());
                ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
                ctx.tb.output.value = {
                    val: {
                        sub: { supersub: 123 },
                        sub2: 'magic'
                    }
                };
                const output = dataOutput<object>({
                    path: makeGetter((bag) => bag.tb.input.pathKey)
                });
                const sub = dataSub({ parent: output, path: makeGetter(() => ['s', 'u', 'b'].join('')) });

                ctx.data.relative.push(sub);
            });

            const relative = dataRelative({ path: 'supersub' });

            it('gets', () => {
                expect(relative.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = relative.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(relative.get(ctx)).toBe(456);
                expect((ctx.tb.output.value.val as any).sub.supersub).toBe(456);
            });
        });

        describe('getter path', () => {
            beforeEach(() => {
                ctx = makeCtxBag(makeEmptyCtx());
                ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
                ctx.tb.output.value = {
                    val: {
                        sub: { supersub: 123 },
                        sub2: 'magic'
                    }
                };
                const output = dataOutput<object>({
                    path: makeGetter((bag) => bag.tb.input.pathKey)
                });
                const sub = dataSub({ parent: output, path: makeGetter(() => ['s', 'u', 'b'].join('')) });

                ctx.data.relative.push(sub);
            });

            const relative = dataRelative({
                path: makeGetter(() => ['super', 'sub'].join(''))
            });

            it('gets', () => {
                expect(relative.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = relative.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(relative.get(ctx)).toBe(456);
                expect((ctx.tb.output.value.val as any).sub.supersub).toBe(456);
            });
        });

        describe('nested', () => {
            beforeEach(() => {
                ctx = makeCtxBag(makeEmptyCtx());
                ctx.tb.input = { pathVal: 123, pathKey: 'val', d: 999 };
                ctx.tb.output.value = {
                    val: {
                        sub: { supersub: 123 },
                        sub2: 'magic'
                    }
                };

                const output = dataOutput<object>({
                    path: makeGetter((bag) => bag.tb.input.pathKey)
                });

                const relative1 = dataRelative({
                    path: makeGetter(() => ['sub'].join(''))
                });

                ctx.data.relative = [...ctx.data.relative, output, relative1];
            });

            const relative = dataRelative({
                path: makeGetter(() => ['super', 'sub'].join(''))
            });

            it('gets', () => {
                expect(relative.get(ctx)).toBe(123);
            });
            it('providesProxy', () => {
                const proxy = relative.makeProxy(ctx);

                expect(proxy.value).toBe(123);
                proxy.value = 456;
                expect(proxy.value).toBe(456);

                expect(relative.get(ctx)).toBe(456);
                expect((ctx.tb.output.value.val as any).sub.supersub).toBe(456);
            });
        });
    });
});
