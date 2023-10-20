import { OnboardingAnchor } from '@toloka-tb/common/components/Onboarding';
import { observer } from 'mobx-react-lite';
import { editor } from 'monaco-editor';
import * as React from 'react';

import { controller } from '../../sideEffect/controller';
import { featuresStore } from '../../store/features';
import { inputStore } from '../../store/inputStore';
import { Editor } from '../Editor/Editor';
import { introOnboardingSteps } from '../Onboarding/Onboarding';
import styles from './Input.less';

const onModelChange = (model: editor.IModel | null) => (inputStore.monacoModel = model);

export const Input: React.FC = observer(() => {
    const isReadonly = featuresStore.readonly;
    const handleEditorChange = React.useCallback((monaco: editor.ICodeEditor | null) => {
        inputStore.monaco = monaco;
    }, []);

    return (
        <OnboardingAnchor name={introOnboardingSteps.input} className={styles.onboardingWrapper}>
            <Editor
                value={inputStore.current}
                onChange={(value) => {
                    inputStore.current = value;
                    controller.onChangeInputDataConfig();
                }}
                mainEditor={false}
                onEditorChange={handleEditorChange}
                onModelChange={onModelChange}
                isReadonly={isReadonly}
                language="json"
            />
        </OnboardingAnchor>
    );
});
