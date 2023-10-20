import { useMonaco } from '@toloka-tb/editor.monaco';
import { useEffect, useState } from 'react';

let themeIsRegistered = false;

export const useTheme = () => {
    const monaco = useMonaco();
    const [isRegistered, setIsRegistered] = useState(themeIsRegistered);

    useEffect(() => {
        if (monaco === null || themeIsRegistered) {
            return;
        }
        monaco.editor.defineTheme('tb', {
            base: 'vs',
            inherit: true,
            rules: [
                {
                    token: 'string.value.json',
                    foreground: '#0c969b'
                },
                {
                    token: 'number.json',
                    foreground: '#c96765'
                },
                {
                    token: 'keyword.json',
                    foreground: '#c96765'
                }
            ],
            colors: {
                'editorIndentGuide.activeBackground': '#666666ee',
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
        });
        themeIsRegistered = true;
        setIsRegistered(true);
    }, [monaco]);

    return isRegistered;
};
