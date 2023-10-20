import { makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';
import { OnboardingProvider, OnboardingsSet } from '@toloka-tb/common/components/Onboarding';
import { useObserver } from 'mobx-react-lite';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { appStore } from '../../store/appStore';
import { configStore } from '../../store/configStore';
import { featuresStore } from '../../store/features';
import { previewStore } from '../../store/previewStore';

export const introOnboardingSteps = {
    config: 'config',
    preview: 'preview',
    inputToggle: 'inputToggle',
    input: 'input',
    fullscreenToggle: 'fullscreenToggle',
    documentation: 'documentation'
};

const onboardings: OnboardingsSet = [
    {
        onboardingName: 'intro',
        steps: [
            {
                anchorName: introOnboardingSteps.config,
                title: 'onboardings.intro.config.title',
                content: 'onboardings.intro.config.content'
            },
            {
                anchorName: introOnboardingSteps.preview,
                title: 'onboardings.intro.preview.title',
                content: 'onboardings.intro.preview.content'
            },
            {
                anchorName: introOnboardingSteps.inputToggle,
                title: 'onboardings.intro.toggle-input.title',
                content: 'onboardings.intro.toggle-input.content'
            },
            {
                anchorName: introOnboardingSteps.input,
                title: 'onboardings.intro.input.title',
                content: 'onboardings.intro.input.content'
            },
            {
                anchorName: introOnboardingSteps.fullscreenToggle,
                title: 'onboardings.intro.fullscreen.title',
                content: 'onboardings.intro.fullscreen.content'
            },
            {
                anchorName: introOnboardingSteps.documentation,
                title: 'onboardings.intro.documentation.title',
                content: 'onboardings.intro.documentation.content'
            }
        ]
    }
];

export const OnboardingManager: React.FC = ({ children }) => {
    const [t] = useTranslation();
    const locale = React.useMemo(
        () => ({
            next: t('onboarding-controls.next'),
            back: t('onboarding-controls.back'),
            close: t('onboarding-controls.close'),
            skip: t('onboarding-controls.skip'),
            complete: t('onboarding-controls.complete'),
            step: (current: number, total: number) => t('onboarding-controls.stepTemplate', { current, total })
        }),
        [t]
    );

    const fullscreenToggleEnabled = useObserver(() => featuresStore.fullscreen);
    const enabledPanes = useObserver(() => ({ ...featuresStore.panes }));
    const skipAnchors = React.useMemo(
        () => ({
            fullscreenToggle: !fullscreenToggleEnabled,
            config: !enabledPanes.config,
            input: !enabledPanes.input,
            inputToggle: !enabledPanes.input,
            preview: !enabledPanes.preview
        }),
        [enabledPanes.config, enabledPanes.input, enabledPanes.preview, fullscreenToggleEnabled]
    );

    const uiLoaded = useObserver(() =>
        Boolean(
            previewStore.ctx ||
                configStore.errors.validation.length > 0 ||
                configStore.errors.compilation ||
                configStore.errors.parsing
        )
    );
    const onboardingFeatureEnabled = useObserver(
        () => featuresStore.support.onboarding && appStore.configMode === 'json'
    );
    const ongoingOnboardings = useObserver(() => ({ ...appStore.ongoingOnboardings }));

    const currentOnboarding = React.useMemo(() => {
        if (!uiLoaded) return;
        if (!onboardingFeatureEnabled) return;
        if (ongoingOnboardings.intro) return 'intro';
    }, [ongoingOnboardings.intro, onboardingFeatureEnabled, uiLoaded]);

    const ensureAllPanesOpened = React.useCallback(() => {
        if (!appStore.paneIsOpen.config) {
            appStore.paneIsOpen.config = true;
        }
        if (!appStore.paneIsOpen.input) {
            appStore.paneIsOpen.input = true;
        }
        if (!appStore.paneIsOpen.preview) {
            appStore.paneIsOpen.preview = true;
        }
    }, []);

    const handleStepChange = React.useCallback(
        (anchorName: string) => {
            if (anchorName === 'config' || anchorName === 'input' || anchorName === 'preview') {
                ensureAllPanesOpened();
            }
        },
        [ensureAllPanesOpened]
    );

    React.useEffect(() => {
        if (currentOnboarding === 'intro') {
            ensureAllPanesOpened();
        }
    }, [currentOnboarding, ensureAllPanesOpened]);

    const handleFinish = React.useCallback(
        (finishType) => {
            if (currentOnboarding) {
                appStore.ongoingOnboardings[currentOnboarding] = false;

                makePostMessageRequest(window.parent, 'onEditorOnboardingFinish', {
                    onboardingName: currentOnboarding,
                    finishType
                });
            }
        },
        [currentOnboarding]
    );

    return (
        <OnboardingProvider
            onboardings={onboardings}
            onStepChange={handleStepChange}
            onFinish={handleFinish}
            translate={t}
            currentOnboarding={currentOnboarding}
            skipAnchors={skipAnchors}
            locale={locale}
        >
            {children}
        </OnboardingProvider>
    );
};
