import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import { editor, KeyCode, KeyMod, Uri } from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';

import { appStore } from '../../store/appStore';
import styles from './Editor.less';
import { langName, registerLanguage } from './lang/adapterMonaco/register';
import { defineTbTheme } from './lang/adapterMonaco/tokens/theme';

registerLanguage();
defineTbTheme();

export interface Props {
    onChange: (value: string) => void;
    onEditorChange: (editor: editor.ICodeEditor | null) => void;
    onModelChange: (model: editor.IModel | null) => void;
    value: string;
    language: string;
    mainEditor: boolean;
    isReadonly?: boolean;
}

const getMonacoHotkey = (hotkey: string) => {
    let monacoHotkey = 0;

    if (hotkey.includes('+')) {
        const keys = hotkey.split('+');

        // eslint-disable-next-line no-bitwise
        monacoHotkey = (KeyMod as any)[keys[0]] | (KeyCode as any)[keys[1]];
    } else {
        monacoHotkey = (KeyCode as any)[hotkey];
    }

    return monacoHotkey;
};

const lineBreakWithAutoTab = /\r*\n\s*\n*$/;

const configModel = ('inmemory://inmemory/spec.tb' as any) as Uri;
const inputModel = ('inmemory://inmemory/input.json' as any) as Uri;

const getModel = (mainEditor: boolean, monaco: any, value: string) => {
    const uri = mainEditor ? configModel : inputModel;
    const model = monaco.editor.getModel(uri);

    if (model) {
        return model;
    }

    return monaco.editor.createModel(value, mainEditor ? langName : 'json', uri);
};

let isWindowFocused = false;
const isStandalone = window.top === window;

window.addEventListener('focus', () => (isWindowFocused = true));
window.addEventListener('blur', () => (isWindowFocused = false));

export const Editor: React.FunctionComponent<Props> = observer(
    ({ onChange, value, language, mainEditor, onEditorChange, onModelChange, isReadonly }) => {
        const [editor, setEditor] = React.useState<null | editor.IStandaloneCodeEditor>(null);

        React.useEffect(() => {
            if (editor) {
                onEditorChange(editor);
            }

            if (editor && (isWindowFocused || isStandalone)) {
                editor.focus();
            }

            return () => onEditorChange(null);
        }, [editor, onEditorChange]);

        const monaco = React.useMemo(
            () => (
                <MonacoEditor
                    value={value}
                    onChange={onChange}
                    language={language}
                    theme={'tb'}
                    options={{
                        suggestSelection: 'first',
                        automaticLayout: true,
                        readOnly: isReadonly,
                        minimap: { enabled: false }
                    }}
                    editorDidMount={(editor, monaco) => {
                        setEditor(editor);

                        if (appStore.settings.formatHotkey !== '') {
                            editor.addCommand(getMonacoHotkey(appStore.settings.formatHotkey), () => {
                                editor.trigger('user-action', 'editor.action.formatDocument', true);
                            });
                        }

                        if (mainEditor) {
                            editor.onDidChangeModelContent((event) => {
                                if (event.changes.length > 0) {
                                    const change = event.changes[0];

                                    if (
                                        (lineBreakWithAutoTab.test(change.text) && event.changes.length === 1) ||
                                        ['""', ':', ' ', '[]', '{}'].includes(change.text) ||
                                        // deleted a big chunk of text
                                        (event.changes[0].rangeLength > 4 && event.changes[0].text.length === 0)
                                    ) {
                                        setTimeout(() => {
                                            editor.trigger('user-action', 'editor.action.triggerSuggest', true);
                                        }, 0);
                                    }
                                }
                            });
                        }

                        if (mainEditor && appStore.settings.autocompleteHotkey !== '') {
                            editor.addCommand(getMonacoHotkey(appStore.settings.autocompleteHotkey), () => {
                                editor.trigger('user-action', 'editor.action.triggerSuggest', true);
                            });
                        }

                        const model = getModel(mainEditor, monaco, value);

                        editor.setModel(model);
                        onModelChange(model);
                    }}
                />
            ),
            [value, onChange, language, mainEditor, isReadonly, onModelChange]
        );

        return (
            <div className={cx(styles.container, isReadonly && styles.containerReadonly)}>
                <div className={styles.content}>{monaco}</div>
            </div>
        );
    }
);
