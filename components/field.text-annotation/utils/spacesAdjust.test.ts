import { spacesAdjust } from './spacesAdjust';

describe('field.text-annotation', () => {
    describe('spacesAdjust', () => {
        it('should add spaces to words in middle of text', () => {
            expect(spacesAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 12, length: 5 })).toEqual({
                label: 'a',
                offset: 11,
                length: 7
            });
        });
        it('should add spaces to words in start of text', () => {
            expect(spacesAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 0, length: 5 })).toEqual({
                label: 'a',
                offset: 0,
                length: 6
            });
        });
        it('should add spaces to words in end of text', () => {
            expect(spacesAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 22, length: 4 })).toEqual({
                label: 'a',
                offset: 21,
                length: 5
            });
        });
        it('should not change entity inside of word', () => {
            expect(spacesAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 14, length: 1 })).toEqual({
                label: 'a',
                offset: 14,
                length: 1
            });
        });
        it('should not change entity inside of space', () => {
            expect(spacesAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 11, length: 1 })).toEqual({
                label: 'a',
                offset: 11,
                length: 1
            });
        });
        it('should take full long space', () => {
            expect(spacesAdjust('Lorem ipsum        dolor sit amet', { label: 'a', offset: 13, length: 2 })).toEqual({
                label: 'a',
                offset: 11,
                length: 8
            });
        });
    });
});
