export const prettifyJsonError = (message: string, json: string, showLines: number = 6) => {
    if (message.startsWith('Unexpected') && message.includes('at position')) {
        const positionContainer = message.substr(message.lastIndexOf('at position ') + 'at position '.length);
        const position = parseInt(positionContainer, 10);

        if (!isNaN(position)) {
            const allTextBefore = json.substr(0, position);
            const allTextAfter = json.substr(position);
            const onLineBreakingPosition = allTextBefore.length + allTextAfter.indexOf('\n');
            const textBefore = json.substr(0, onLineBreakingPosition);
            const textAfter = json.substr(onLineBreakingPosition + 1);
            const cutBefore = textBefore
                .split('\n')
                .map((line, lineIndex) => `${lineIndex + 1}: ${line}`)
                .slice(-1 * Math.round(showLines / 2))
                .join('\n');
            const linesBefore = textBefore.split('\n').length;
            const cutAfter = textAfter
                .split('\n')
                .map((line, lineIndex) => `${lineIndex + linesBefore + 1}: ${line}`)
                .slice(0, Math.round(showLines / 2))
                .join('\n');
            const linePosition = textBefore.split('\n').length;

            const inLinePosition =
                position -
                textBefore
                    .split('\n')
                    .slice(0, -1)
                    .join('\n').length;
            const cursorLeftGap = Array(inLinePosition + linePosition.toString().length + 1);
            const insertedLine = `${cursorLeftGap.fill(' ').join('')}^`;
            const cutBeforeSplit = cutBefore.split('\n');

            cutBeforeSplit[cutBeforeSplit.length - 1] = `${cutBeforeSplit[cutBeforeSplit.length - 1]}`;

            return `${message.replace(/\n/g, '⏎')}\n\n${cutBeforeSplit.join('\n')}\n${insertedLine}\n${cutAfter}`;
        }

        return message;
    }

    return message;
};
