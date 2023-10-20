import Editor, { loader, Monaco, useMonaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

loader.config({
    paths: {
        vs: 'https://tlkfrontprod.azureedge.net/template-builder-production/static/monaco-editor@0.21.2/vs'
    }
});

export type EditorInstance = editor.IStandaloneCodeEditor;

export { Editor, useMonaco, Monaco };
