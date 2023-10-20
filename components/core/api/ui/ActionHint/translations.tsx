import translations from '../../../i18n/core.translations';

export const keys = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'q',
    'w',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    '[',
    '{',
    ']',
    '}',
    '|',
    '`',
    '~',
    'a',
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    ';',
    ':',
    "'",
    '"',
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
    ',',
    '<',
    '.',
    '>',
    '/',
    '?',
    '@',
    '#',
    '$',
    '^',
    '&'
];

const makeLetters = (letters: string[], transformer: (key: string) => string) => {
    const res = {} as { [key: string]: string };

    for (const letter of letters) {
        res[letter] = transformer(letter);
    }

    return res;
};

const en = {
    alt: 'Alt',
    ctrl: 'Ctrl',
    esc: 'Esc',
    enter: 'Enter',
    meta: 'Meta',
    backspace: 'Backspace',
    tab: 'Tab',
    capslock: 'Capslock',
    escape: 'Escape',
    pageup: 'Pageup',
    pagedown: 'Pagedown',
    end: 'End',
    home: 'Home',
    ins: 'Ins',
    del: 'Del',
    win: '⊞ Windows',
    plus: 'Plus',
    '⌥': '⌥',
    '⌫': '⌫',
    '⌃': '⌃',
    '⌘': '⌘',
    '⇧': '⇧ Shift',
    ...translations.en,

    ...makeLetters(keys, (x) => x.toUpperCase())
};

export const hotkeyBtnTranslations = {
    ru: {
        ...en,
        ...translations.ru
    },

    en
};
