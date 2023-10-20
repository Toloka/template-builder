import { Pane, PaneContent, PaneTitle } from '@toloka-tb/editor.pane';
import { ResizableList, ResizableListItem } from '@toloka-tb/editor.resizable-list';
import { OnboardingAnchor } from '@toloka-tb/common/components/Onboarding';
import { observer } from 'mobx-react-lite';
import { editor } from 'monaco-editor';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { BriefEditor } from '../../breif/BriefEditor';
import { editorI18n } from '../../i18n/editorI18n';
import { controller } from '../../sideEffect/controller';
import { appStore } from '../../store/appStore';
import { configStore } from '../../store/configStore';
import { featuresStore } from '../../store/features';
import { intlStore } from '../../store/intlStore';
import { Editor } from '../Editor/Editor';
import { introOnboardingSteps } from '../Onboarding/Onboarding';
import styles from './Config.less';
import { Intl } from './Intl';

const onModelChange = (model: editor.IModel | null) => (configStore.monacoModel = model);

type ConfigEditorProps = {
    onChange?: (value: string) => void;
};

const ConfigEditor = observer<ConfigEditorProps>(({ onChange }) => {
    const isReadonly = featuresStore.readonly;
    const handleEditorChange = React.useCallback((monaco: editor.ICodeEditor | null) => {
        configStore.monaco = monaco;
    }, []);

    return (
        <Editor
            value={configStore.current}
            onChange={(value) => {
                configStore.current = value;
                if (onChange) {
                    onChange(value);
                }
            }}
            onEditorChange={handleEditorChange}
            onModelChange={onModelChange}
            mainEditor={true}
            isReadonly={isReadonly}
            language="tb"
        />
    );
});

const scrollToCursor = (monaco: editor.ICodeEditor) => () => {
    const position = monaco.getPosition();

    // moanco editor does scroll cleanup after layout, so we delay our scroll so it actually happens
    if (position) {
        setTimeout(() => monaco.revealLineInCenterIfOutsideViewport(position.lineNumber), 0);
    }
};

export const Config = observer(() => {
    const [t] = useTranslation('launcher.editor', { i18n: editorI18n });

    const onConfigEditorChange = () => {
        controller.onConfigEditorChange();
    };

    const subPanes: ResizableListItem[] = [
        {
            content:
                appStore.configMode === 'brief' && configStore.brief ? (
                    <PaneContent>
                        <BriefEditor store={configStore.brief} />
                    </PaneContent>
                ) : (
                    <ConfigEditor onChange={onConfigEditorChange} />
                ),
            id: 'editor',
            initialSize: '1'
        }
    ];

    if (featuresStore.intl && intlStore.keys.length > 0) {
        subPanes.push({
            id: 'intl',
            content: (
                <Pane>
                    <PaneTitle>{t('initialLaungageTranslations')}</PaneTitle>
                    <PaneContent>
                        <Intl />
                    </PaneContent>
                </Pane>
            ),
            initialSize: '1'
        });
    }

    const hasIntl = subPanes.some((pane) => pane.id === 'intl');

    React.useEffect(() => {
        const monaco = configStore.monaco;

        if (!monaco) {
            return;
        }

        const disposable = monaco.onDidLayoutChange(scrollToCursor(monaco));

        return () => disposable.dispose();
    }, [hasIntl]);

    return (
        <OnboardingAnchor name={introOnboardingSteps.config} className={styles.onboardingWrapper}>
            <ResizableList items={subPanes} direction="vertical" />
        </OnboardingAnchor>
    );
});
