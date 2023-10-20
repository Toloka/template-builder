import ru from 'convert-layout/ru';

// transforms single letters, skipping words, like v + alt -> м + alt
export const enToLang = (sequence: string, transformer: (char: string) => string) => {
    const isAlpha = /[a-zA-Z]/;

    let newStr = '';

    for (let i = 0; i < sequence.length; ++i) {
        const char = sequence[i];
        const prev = sequence[i - 1] || '';
        const next = sequence[i + 1] || '';

        if (isAlpha.test(char) && !isAlpha.test(prev) && !isAlpha.test(next)) {
            newStr += transformer(char);
        } else {
            newStr += char;
        }
    }

    return newStr;
};

export const multiLangKeySequence = (sequence: string) => {
    return [sequence, enToLang(sequence, ru.fromEn)];
};
