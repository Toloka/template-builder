import { Editor } from '@toloka-tb/editor.monaco';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';

import styles from './editor.input.less';
import { createInputStore, InputStore } from './editor.input.store';
import { useTheme } from './theme';

export const InputEditor = observer(({ store }: { store: InputStore }) => {
    const hasTheme = useTheme();

    if (!hasTheme) {
        return null;
    }

    return (
        <div className={cx(styles.container)}>
            <div className={styles.content}>
                <Editor
                    defaultLanguage="json"
                    value={store.text}
                    theme="tb"
                    options={{ minimap: { enabled: false } }}
                    onChange={(newVal) => (store.text = newVal || '')}
                    onMount={(editor) => (store.editor = editor)}
                />
            </div>
            ∂
        </div>
    );
});

export { createInputStore, InputStore };
