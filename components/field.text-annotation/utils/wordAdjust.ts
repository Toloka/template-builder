import { Entity } from '../ctx/ctx';

const nonLetterRegexp = /[^\p{L}\p{N}]/u;
const letterRegexp = /[\p{L}\p{N}]/u;

const reverseStr = (str: string) =>
    str
        .split('')
        .reverse()
        .join('');

export const wordAdjust = (textContent: string, entity: Entity) => {
    const startReversedText = reverseStr(textContent.substring(0, entity.offset));

    const middleText = textContent.substr(entity.offset, entity.length);
    const middleReversedText = reverseStr(middleText);
    const endText = textContent.substring(entity.offset + entity.length);

    const startEdgeSymbol = middleText[0];
    const endEdgeSymbol = middleReversedText[0];

    let toStartChange = 0;
    let toEndChange = 0;

    if (letterRegexp.test(startEdgeSymbol)) {
        toStartChange = `${startReversedText} `.search(nonLetterRegexp);
    } else {
        const change = middleText.search(letterRegexp);

        toStartChange = change === -1 ? 0 : -1 * change;
    }
    if (letterRegexp.test(endEdgeSymbol)) {
        toEndChange = `${endText} `.search(nonLetterRegexp);
    } else {
        const change = middleReversedText.search(letterRegexp);

        toEndChange = change === -1 ? 0 : -1 * change;
    }

    return {
        ...entity,
        offset: entity.offset - toStartChange,
        length: entity.length + toStartChange + toEndChange
    };
};
