import 'microtip/microtip.css';

import { IconAttachment } from '@toloka-tb/common/icons/attachment';
import { IconEdit } from '@toloka-tb/common/icons/edit';
import { IconFullscreen } from '@toloka-tb/common/icons/fullscreen';
import { IconFullscreenExit } from '@toloka-tb/common/icons/fullscreenExit';
import { IconInput } from '@toloka-tb/common/icons/input';
import { IconPreview } from '@toloka-tb/common/icons/preview';
import copy from 'copy-to-clipboard';
import { OnboardingAnchor } from '@toloka-tb/common/components/Onboarding';
import { RadioButton } from '@toloka-tb/common/components/RadioButton';
import { observer, useObserver } from 'mobx-react-lite';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { swtichToBrief, swtichToCode } from '../../breif/configBreifIntegration';
import { controller } from '../../sideEffect/controller';
import { AppState, appStore } from '../../store/appStore';
import { configStore } from '../../store/configStore';
import { featuresStore } from '../../store/features';
import { Documentation } from '../Documentation/Documentation';
import { introOnboardingSteps } from '../Onboarding/Onboarding';
import { Settings } from '../Settings/Settings';
import { IconButton } from '../UI/IconButton/IconButton';
import styles from './Header.less';

const panes: Partial<{ [Pane in keyof AppState['paneIsOpen']]: { label: string; icon: typeof IconEdit } }> = {
    config: {
        label: 'config',
        icon: IconEdit
    },
    preview: {
        label: 'preview',
        icon: IconPreview
    },
    input: {
        label: 'inputData',
        icon: IconInput
    }
};

const toggleFullscreen = () => controller.setFullscreen(!appStore.isFullscreen);

const PaneButton: React.FC<{
    pane: keyof AppState['paneIsOpen'];
    pin: 'round-clear' | 'brick-clear' | 'brick-round' | undefined;
}> = ({ pane, pin }) => {
    const [t] = useTranslation();
    const isOpen = useObserver(() => appStore.paneIsOpen[pane]);
    const togglePane = React.useCallback(() => controller.setPaneOpen(pane, !appStore.paneIsOpen[pane]), [pane]);

    const Icon = panes[pane]!.icon;
    const label = t(panes[pane]!.label);

    return (
        <span aria-label={label} data-microtip-position="bottom-right" role="tooltip">
            <IconButton checked={isOpen} onClick={togglePane} size="s" pin={pin}>
                <Icon fill={isOpen ? 'white' : 'black'} />
            </IconButton>
        </span>
    );
};

const paneOrder = ['config', 'input', 'preview'] as const;
const getGroupButtonPin = (length: number, index: number) => {
    // one element in the group, default button styles
    if (length === 1) return undefined;

    if (index === 0) return 'round-clear';
    if (index === length - 1) return 'brick-round';

    return 'brick-clear';
};

const Panes: React.FC = () => {
    const visiblePanes = useObserver(() => paneOrder.filter((pane) => featuresStore.panes[pane]));

    return (
        <>
            {visiblePanes.map((pane, index) =>
                pane === 'input' ? (
                    <OnboardingAnchor key={pane} name={introOnboardingSteps.inputToggle}>
                        <PaneButton pane={pane} pin={getGroupButtonPin(visiblePanes.length, index)} />
                    </OnboardingAnchor>
                ) : (
                    <PaneButton key={pane} pane={pane} pin={getGroupButtonPin(visiblePanes.length, index)} />
                )
            )}
        </>
    );
};

export const Header = observer(() => {
    const [linkWasCopied, setLinkWasCopied] = React.useState(false);
    const linkTimeoutRef = React.useRef<number>();
    const [t, i18n] = useTranslation();

    const copyLink = React.useCallback(() => {
        setLinkWasCopied(true);
        copy(window.location.href);
        const timeoutId = window.setTimeout(() => {
            if (linkTimeoutRef.current === timeoutId) {
                setLinkWasCopied(false);
            }
        }, 2000);

        linkTimeoutRef.current = timeoutId;
    }, []);

    const showSupport =
        appStore.configMode === 'json' &&
        ((featuresStore.support.documentationUrl && featuresStore.support.documentationUrl[i18n.language]) ||
            featuresStore.support.onboarding);

    return (
        <div className={styles.header}>
            <div className={styles.buttonGroup}>
                {featuresStore.brief.enabled && configStore.brief && (
                    <div className={styles.breif}>
                        <RadioButton
                            view="default"
                            size="s"
                            options={[
                                { children: t('codeVisualSwitcher.visual'), value: 'brief' },
                                { children: t('codeVisualSwitcher.code'), value: 'json' }
                            ]}
                            value={appStore.configMode}
                            onChange={(e) => {
                                const desiredState = e.target.value as 'brief' | 'json';

                                if (desiredState === 'brief') swtichToBrief();
                                else swtichToCode();
                            }}
                        />
                    </div>
                )}
                {appStore.configMode === 'json' && <Panes />}
            </div>

            <div className={styles.buttonGroup}>
                {featuresStore.fullscreen && (
                    <OnboardingAnchor name={introOnboardingSteps.fullscreenToggle}>
                        <span aria-label={t('toggleFullscreen')} data-microtip-position="bottom-left" role="tooltip">
                            <IconButton
                                size="s"
                                checked={appStore.isFullscreen}
                                onClick={toggleFullscreen}
                                pin={featuresStore.export || showSupport ? 'round-clear' : undefined}
                            >
                                {appStore.isFullscreen ? (
                                    <IconFullscreenExit width={16} height={16} viewBox="2 2 20 20" fill="white" />
                                ) : (
                                    <IconFullscreen width={16} height={16} viewBox="2 2 20 20" />
                                )}
                            </IconButton>
                        </span>
                    </OnboardingAnchor>
                )}
                {featuresStore.export && (
                    <>
                        <span
                            aria-label={linkWasCopied ? t('linkCopied') : t('shareTemplate')}
                            data-microtip-position="bottom-left"
                            role="tooltip"
                        >
                            <IconButton
                                size={'s'}
                                onClick={copyLink}
                                pin={featuresStore.fullscreen ? 'brick-clear' : 'round-clear'}
                            >
                                <IconAttachment />
                            </IconButton>
                        </span>
                        <span
                            aria-label={t('settings.title')}
                            data-microtip-position="bottom-left"
                            role={!appStore.modalIsOpen.settings ? 'tooltip' : undefined}
                        >
                            <Settings pin={showSupport ? 'brick-clear' : 'brick-round'} />
                        </span>
                    </>
                )}

                {showSupport && (
                    <span
                        aria-label={t('documentation.hint')}
                        data-microtip-position="bottom-left"
                        role={!appStore.modalIsOpen.documentation ? 'tooltip' : undefined}
                    >
                        <Documentation
                            pin={featuresStore.fullscreen || featuresStore.export ? 'brick-round' : undefined}
                        />
                    </span>
                )}
            </div>
        </div>
    );
});
