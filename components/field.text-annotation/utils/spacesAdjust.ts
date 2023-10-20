import { Entity } from '../ctx/ctx';

const letterRegexp = /[\p{L}\p{N}]/u;

const reverseStr = (str: string) =>
    str
        .split('')
        .reverse()
        .join('');

export const spacesAdjust = (textContent: string, entity: Entity) => {
    const startReversedText = reverseStr(textContent.substring(0, entity.offset));
    const endText = textContent.substring(entity.offset + entity.length);

    let toStartChange = startReversedText.search(letterRegexp);
    let toEndChange = endText.search(letterRegexp);

    if (toStartChange === -1) {
        toStartChange = 0;
    }
    if (toEndChange === -1) {
        toEndChange = 0;
    }

    return {
        ...entity,
        offset: entity.offset - toStartChange,
        length: entity.length + toStartChange + toEndChange
    };
};
