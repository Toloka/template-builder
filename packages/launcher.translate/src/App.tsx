import { ResizableList } from '@toloka-tb/editor.resizable-list';
import { initTheme } from '@toloka-tb/common/tools/initTheme';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { render as reactDOMRender } from 'react-dom';
import { IntlProvider } from 'react-intl';

import styles from './App.less';
import { Data } from './Data/Data';
import { Preview } from './Preview/Preview';
import { Store } from './store';

const App: React.FC<{ store: Store }> = observer(({ store }) => {
    return (
        <ResizableList
            items={[
                {
                    id: 'preview',
                    initialSize: '8',
                    content: <Preview store={store.preview} />
                },
                {
                    id: 'data',
                    content: <Data input={store.preview.input} output={store.preview.output} />,
                    initialSize: '2'
                }
            ]}
            direction="vertical"
        />
    );
});

const AppRoot: React.FC<{ store: Store }> = observer(({ store }) => {
    return (
        <IntlProvider messages={store.ui.translations} locale={store.ui.locale}>
            <App store={store} />
        </IntlProvider>
    );
});

export const render = (store: Store) => {
    const rootNode = document.createElement('div');

    rootNode.classList.add(styles.root);
    rootNode.classList.add('text-m');

    document.body.appendChild(rootNode);

    initTheme();
    reactDOMRender(<AppRoot store={store} />, rootNode);
};
