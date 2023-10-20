import { languages } from 'monaco-editor';

export const languageConfig: languages.LanguageConfiguration = {
    wordPattern: /(-?\d*\.\d\w*)|([^[{]}:",\s]+)/g,

    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
    },

    brackets: [
        ['{', '}'],
        ['[', ']']
    ],

    autoClosingPairs: [
        { open: '{', close: '}', notIn: ['string'] },
        { open: '[', close: ']', notIn: ['string'] },
        { open: '"', close: '"', notIn: ['string'] }
    ]
};
