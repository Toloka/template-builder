import { rangeInsideRange } from './rangeInsideRange';

describe('field.text-annotation', () => {
    describe('rangeInsideRange', () => {
        it('should return true when range inside of range', () => {
            expect(rangeInsideRange([10, 20], [12, 18])).toBeTruthy();
        });
        it('should return false when range outside of range', () => {
            expect(rangeInsideRange([10, 12], [18, 20])).toBeFalsy();
        });
        it('should return false when ranges touches by the edge', () => {
            expect(rangeInsideRange([10, 15], [15, 20])).toBeFalsy();
        });
        it('should return true when ranges partly overlaps', () => {
            expect(rangeInsideRange([10, 16], [15, 20])).toBeTruthy();
        });
        it('should return true when on full overlap', () => {
            expect(rangeInsideRange([10, 20], [10, 20])).toBeTruthy();
        });
    });
});
