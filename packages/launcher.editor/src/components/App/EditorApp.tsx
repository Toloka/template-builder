import cx from 'classnames';
import * as React from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import { OnboardingManager } from '../Onboarding/Onboarding';
import styles from './EditorApp.less';

Modal.setAppElement(document.body);

import { Pane, PaneContent, PaneTitle } from '@toloka-tb/editor.pane';
import { ResizableList, ResizableListItem } from '@toloka-tb/editor.resizable-list';
import { Spin } from '@toloka-tb/common/components/Spin';
import { observer } from 'mobx-react-lite';
import { IntlProvider } from 'react-intl';

import { editorI18n, intlMessages } from '../../i18n/editorI18n';
import { appStore } from '../../store/appStore';
import { featuresStore } from '../../store/features';
import { Header } from '../Header/Header';
import { Config } from '../Panes/Config';
import { Empty } from '../Panes/Empty';
import { Input } from '../Panes/Input';
import { OutputPane } from '../Panes/Output';
import { PreviewPane } from '../Panes/Preview';

const AppPanes = observer(() => {
    const panes: ResizableListItem[] = [];
    const [t] = useTranslation('launcher.editor', { i18n: editorI18n });

    if (appStore.paneIsOpen.config && featuresStore.panes.config) {
        panes.push({
            content: (
                <Pane>
                    <PaneTitle>{t('config')}</PaneTitle>
                    <PaneContent>
                        <Config />
                    </PaneContent>
                </Pane>
            ),
            id: 'config',
            initialSize: '4',
            minWidth: '27%'
        });
    }
    if (appStore.paneIsOpen.input && featuresStore.panes.input) {
        panes.push({
            content: (
                <Pane>
                    <PaneTitle>{t('inputData')}</PaneTitle>
                    <PaneContent>
                        <Input />
                    </PaneContent>
                </Pane>
            ),
            id: 'input',
            initialSize: '4'
        });
    }
    if (appStore.paneIsOpen.preview && featuresStore.panes.preview) {
        panes.push({
            content: <PreviewPane />,
            id: 'preview',
            initialSize: '6'
        });
    }
    if (appStore.paneIsOpen.preview && appStore.paneIsOpen.output) {
        panes.push({
            content: (
                <Pane>
                    <PaneTitle>{t('outputData')}</PaneTitle>
                    <OutputPane />
                </Pane>
            ),
            id: 'output',
            initialSize: '4'
        });
    }

    if (panes.length === 0) {
        panes.push({
            content: <Empty />,
            id: 'empty',
            initialSize: '1'
        });
    }

    return (
        <div className={styles.content}>
            <ResizableList items={panes} direction="horizontal" />
            <div
                className={cx(
                    styles.modalOverlay,
                    Object.values(appStore.modalIsOpen).some(Boolean) && styles.modalOverlayVisible
                )}
            />
        </div>
    );
});

const App = observer(() => {
    const messages = intlMessages.get();

    return (
        <I18nextProvider i18n={editorI18n}>
            <IntlProvider locale={appStore.locale || 'en'} messages={messages}>
                <OnboardingManager>
                    <Header />
                    <AppPanes />
                </OnboardingManager>
            </IntlProvider>
        </I18nextProvider>
    );
});

export const EditorApp = () => (
    <React.Suspense
        fallback={
            <div className={styles.spinCentered}>
                <Spin />
            </div>
        }
    >
        <App />
    </React.Suspense>
);
