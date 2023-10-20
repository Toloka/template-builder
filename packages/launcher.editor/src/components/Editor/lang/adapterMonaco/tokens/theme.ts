import { editor } from 'monaco-editor';

import { token } from './tokenizer';

const owl = {
    // view
    view: '#4876d6',
    field: '#7986e7',
    layout: '#4876d6',

    // data
    data: '#994cc3',
    helper: '#c789d6',

    // ref
    ref: '#ec5f67',

    // other
    plugin: '#6622CC',
    action: '#aa0982',

    // primitive
    string: '#0c969b',
    number: '#c96765',
    bool: '#c96765',
    null: '#c96765',

    // secondary
    key: '#989fb1',
    secondary: '#989fb1',

    base: 'vs',

    colors: {
        // Editor
        'editor.background': '#ffffff',
        'editor.foreground': '#403f53',
        'editorCursor.foreground': '#90A7B2',
        'editorLineNumber.foreground': '#90A7B2',
        'editorLineNumber.activeForeground': '#403f53',
        'editor.selectionBackground': '#E0E0E0',
        'editor.selectionHighlightBackground': '#d3e8f8',
        'editor.wordHighlightBackground': '#d3e8f8',
        'editor.wordHighlightStrongBackground': '#A3CFEE',
        'editor.findMatchBackground': '#93A1A16c',
        'editor.findMatchHighlightBackground': '#93a1a16c',
        'editor.findRangeHighlightBackground': '#E0E7EA',
        'editor.hoverHighlightBackground': '#d3e8f8',
        'editor.lineHighlightBackground': '#F0F0F0',
        'editor.rangeHighlightBackground': '#E0E7EA',
        'editorWhitespace.foreground': '#d9d9d9',
        'editorIndentGuide.background': '#d9d9d9',
        'editorCodeLens.foreground': '#403f53',
        'editorBracketMatch.background': '#d3e8f8',
        'editorBracketMatch.border': '#2AA298',
        'editorError.foreground': '#E64D49',
        'editorError.border': '#FBFBFB',
        'editorWarning.foreground': '#daaa01',
        'editorWarning.border': '#daaa01',
        'editorGutter.addedBackground': '#49d0c5',
        'editorGutter.modifiedBackground': '#6fbef6',
        'editorGutter.deletedBackground': '#f76e6e',
        'editorRuler.foreground': '#d9d9d9',
        'editorOverviewRuler.errorForeground': '#E64D49',
        'editorOverviewRuler.warningForeground': '#daaa01',
        // Editor Widget
        'editorWidget.background': '#F0F0F0',
        'editorWidget.border': '#d9d9d9',
        'editorSuggestWidget.background': '#F0F0F0',
        'editorSuggestWidget.foreground': '#403f53',
        'editorSuggestWidget.highlightForeground': '#403f53',
        'editorSuggestWidget.selectedBackground': '#d3e8f8',
        'editorSuggestWidget.border': '#d9d9d9',
        'editorHoverWidget.background': '#F0F0F0',
        'editorHoverWidget.border': '#d9d9d9',
        'debugExceptionWidget.background': '#F0F0F0',
        'debugExceptionWidget.border': '#d9d9d9',
        'editorMarkerNavigation.background': '#D0D0D0',
        'editorMarkerNavigationError.background': '#f76e6e',
        'editorMarkerNavigationWarning.background': '#daaa01'
    }
} as const;

const theme = owl;

export const defineTbTheme = () => {
    editor.defineTheme('tb', {
        base: theme.base,
        inherit: true,
        rules: [
            {
                token: token.type.view,
                foreground: theme.view
            },
            {
                token: token.type.layout,
                foreground: theme.layout
            },
            {
                token: token.type.field,
                foreground: theme.field
            },
            {
                token: token.type.data,
                foreground: theme.data
            },
            {
                token: token.type.helper,
                foreground: theme.helper
            },
            {
                token: token.type.condition,
                foreground: theme.helper
            },
            {
                token: token.type.plugin,
                foreground: theme.plugin
            },
            {
                token: token.type.action,
                foreground: theme.action
            },
            {
                token: token.ref,
                foreground: theme.ref
            },
            {
                token: token.delimiter.quote,
                foreground: theme.secondary
            },
            {
                token: token.delimiter.comma,
                foreground: theme.secondary
            },
            {
                token: token.delimiter.colon,
                foreground: theme.secondary
            },
            {
                token: token.delimiter.array,
                foreground: theme.secondary
            },
            {
                token: token.delimiter.object,
                foreground: theme.secondary
            },
            {
                token: token.key,
                foreground: theme.key
            },
            {
                token: token.value.string,
                foreground: theme.string
            },
            {
                token: token.value.boolean,
                foreground: theme.bool
            },
            {
                token: token.value.number,
                foreground: theme.number
            },
            {
                token: token.value.null,
                foreground: theme.null
            }
        ],
        colors: {
            'editorIndentGuide.activeBackground': '#666666ee',
            'editorIndentGuide.background': '#e3e3e355',
            ...theme.colors
        }
    });
};
