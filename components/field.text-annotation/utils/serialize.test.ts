import { serialize } from './serialize';

describe('field.text-annotation', () => {
    describe('serialize', () => {
        it('should not change splited entities', () => {
            expect(
                serialize([
                    { label: 'a', offset: 1, length: 2 },
                    { label: 'b', offset: 5, length: 2 }
                ])
            ).toEqual([
                { label: 'a', offset: 1, length: 2 },
                { label: 'b', offset: 5, length: 2 }
            ]);
        });
        it('should not change empty entities', () => {
            expect(serialize([])).toEqual([]);
        });
        it('should not change close entitites', () => {
            expect(
                serialize([
                    { label: 'a', offset: 0, length: 2 },
                    { label: 'b', offset: 2, length: 2 }
                ])
            ).toEqual([
                { label: 'a', offset: 0, length: 2 },
                { label: 'b', offset: 2, length: 2 }
            ]);
        });
        it('should set last entity on overlap', () => {
            expect(
                serialize([
                    { label: 'a', offset: 0, length: 2 },
                    { label: 'b', offset: 1, length: 2 }
                ])
            ).toEqual([
                { label: 'a', offset: 0, length: 1 },
                { label: 'b', offset: 1, length: 2 }
            ]);
        });
        it('should set last entity even on full overlap', () => {
            expect(
                serialize([
                    { label: 'a', offset: 0, length: 2 },
                    { label: 'b', offset: 0, length: 2 }
                ])
            ).toEqual([{ label: 'b', offset: 0, length: 2 }]);
        });
        it('should set last entity even on full extended overlap', () => {
            expect(
                serialize([
                    { label: 'a', offset: 10, length: 10 },
                    { label: 'b', offset: 5, length: 20 }
                ])
            ).toEqual([{ label: 'b', offset: 5, length: 20 }]);
        });
        it('should set last entity overlaping multiple entities', () => {
            expect(
                serialize([
                    { label: 'a', offset: 0, length: 10 },
                    { label: 'b', offset: 20, length: 10 },
                    { label: 'c', offset: 5, length: 20 }
                ])
            ).toEqual([
                { label: 'a', offset: 0, length: 5 },
                { label: 'c', offset: 5, length: 20 },
                { label: 'b', offset: 25, length: 5 }
            ]);
        });
    });
});
