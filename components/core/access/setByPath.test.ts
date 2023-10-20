import { observable } from 'mobx';

import { setByPath } from './setByPath';

const commonPath = 'some.path.it.is.very.deep';
const commonValue = 'Hello world';
const commonResult = {
    some: {
        path: {
            it: {
                is: {
                    very: {
                        deep: commonValue
                    }
                }
            }
        }
    }
};
const makeTarget = () => observable({});
const alphabet = 'toloka';

describe('setByPath util', () => {
    it('should set deep values', () => {
        const target = makeTarget();

        setByPath(target, commonPath, commonValue);
        expect(target).toEqual(commonResult);
    });
    it('should set not deep values', () => {
        const target = makeTarget();

        setByPath(target, 'path', commonValue);
        expect(target).toEqual({ path: commonValue });
    });
    it('should work both with string arrays and dot-separated strings', () => {
        const target1 = makeTarget();
        const target2 = makeTarget();

        setByPath(target1, commonPath, commonValue);
        setByPath(target2, commonPath.split('.'), commonValue);
        expect(target1).toEqual(commonResult);
        expect(target2).toEqual(commonResult);
    });
    it('should do the same things with string arrays and dot-separated strings', () => {
        /* eslint-disable max-nested-callbacks */
        const paths = Array(40)
            .fill(0)
            .map(() =>
                Array(Math.floor(Math.random() * 10 + 10))
                    .fill(0)
                    .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
            );
        const target1 = makeTarget();
        const target2 = makeTarget();

        for (const path of paths) {
            const value = Math.random();

            setByPath(target1, path, value);
            setByPath(target2, path.join('.'), value);
        }
        expect(target1).toEqual(target2);
    });
    it('should change nothing with empty path', () => {
        const target = makeTarget();

        setByPath(target, '', commonValue);
        expect(target).toEqual({});
    });
    it('should clear empty paths', () => {
        const target = makeTarget();

        setByPath(target, commonPath, commonValue);
        setByPath(target, commonPath, undefined);
        expect(target).toEqual({});
    });
    it("shouldn't clear non-empty paths", () => {
        const target = makeTarget();

        setByPath(target, commonPath, commonValue);
        setByPath(target, 'some.another.path', commonValue);
        setByPath(target, commonPath, undefined);
        expect(target).toEqual({ some: { another: { path: commonValue } } });
    });
    it('should create arrays when property is number', () => {
        const target = makeTarget();

        setByPath(target, `fooBar.1.2.3.${commonPath}`, commonValue);
        expect(target).toEqual({
            fooBar: [undefined, [undefined, undefined, [undefined, undefined, undefined, commonResult]]]
        });
    });
    it('should handle NaN properties in target', () => {
        const target = makeTarget();

        (target as any)[NaN] = 123;
        const path = 'NaN.baz';

        setByPath(target, path, 321);
        expect(target).toEqual({
            [NaN]: {
                baz: 321
            }
        });
    });
});
