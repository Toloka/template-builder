import { wordAdjust } from './wordAdjust';

describe('field.text-annotation', () => {
    describe('wordAdjust', () => {
        it('should adjust start and end of words in start of text', () => {
            expect(wordAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 1, length: 6 })).toEqual({
                label: 'a',
                offset: 0,
                length: 11
            });
        });
        it('should adjust start and end of words in middle of text', () => {
            expect(wordAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 13, length: 2 })).toEqual({
                label: 'a',
                offset: 12,
                length: 5
            });
        });
        it('should adjust start and end of words in end of text', () => {
            expect(wordAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 23, length: 2 })).toEqual({
                label: 'a',
                offset: 22,
                length: 4
            });
        });
        it('should not change already adjusted text', () => {
            expect(wordAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 12, length: 5 })).toEqual({
                label: 'a',
                offset: 12,
                length: 5
            });
        });
        it('should be stable', () => {
            const text = 'Lorem ipsum dolor sit amet';
            const randomLength = Math.floor((text.length / 2) * Math.random());
            const randomOffset = Math.floor(Math.random() * (text.length - randomLength));

            const firstAdjust = wordAdjust(text, { label: 'a', offset: randomOffset, length: randomLength });
            const secondAdjust = wordAdjust(text, firstAdjust);

            expect(firstAdjust).toEqual(secondAdjust);
        });
        it('should adjust to min word if seprator included', () => {
            expect(wordAdjust('Lorem ipsum dolor sit amet', { label: 'a', offset: 5, length: 7 })).toEqual({
                label: 'a',
                offset: 6,
                length: 5
            });
        });
    });
});
