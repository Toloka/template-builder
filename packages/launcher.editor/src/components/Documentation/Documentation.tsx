import { makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';
import { OnboardingAnchor } from '@toloka-tb/common/components/Onboarding';
import { Popover } from '@toloka-tb/common/components/Popover';
import { QuestionFilledIcon } from '@toloka-tb/common/icons/crowd/QuestionFilled';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { appStore } from '../../store/appStore';
import { featuresStore } from '../../store/features';
import { introOnboardingSteps } from '../Onboarding/Onboarding';
import { IconButton } from '../UI/IconButton/IconButton';
import styles from './Documentation.less';

export const Documentation: React.FC<{ pin: 'brick-round' | 'brick-clear' | undefined }> = observer(({ pin }) => {
    const [t, i18n] = useTranslation();

    const restartIntroOnboarding = React.useCallback(
        action(() => {
            appStore.ongoingOnboardings.intro = true;
            appStore.modalIsOpen.documentation = false;
        }),
        []
    );

    const onClickDocumentation = React.useCallback(() => {
        makePostMessageRequest(window.parent, 'onClickDocumentation', undefined);
    }, []);

    return (
        <OnboardingAnchor name={introOnboardingSteps.documentation}>
            <Popover
                className={styles.container}
                visible={appStore.modalIsOpen.documentation}
                onRequestClose={() => (appStore.modalIsOpen.documentation = false)}
                onRequestOpen={() => (appStore.modalIsOpen.documentation = true)}
                content={
                    <>
                        {featuresStore.support.documentationUrl &&
                            featuresStore.support.documentationUrl[i18n.language] && (
                                <a
                                    onClick={onClickDocumentation}
                                    href={featuresStore.support.documentationUrl[i18n.language]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.row}
                                >
                                    {t('documentation.label')}
                                </a>
                            )}

                        {featuresStore.support.onboarding && (
                            <div onClick={restartIntroOnboarding} className={styles.row}>
                                {t('documentation.restart-intro-onboarding')}
                            </div>
                        )}
                    </>
                }
            >
                <IconButton checked={false} size="s" pin={pin}>
                    <QuestionFilledIcon className={styles.icon} />
                </IconButton>
            </Popover>
        </OnboardingAnchor>
    );
});
