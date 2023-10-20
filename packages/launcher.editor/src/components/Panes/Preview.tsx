import { setValue } from '@toloka-tb/editor.output';
import { Pane, PaneContent, PaneFooter, PaneTitle } from '@toloka-tb/editor.pane';
import { Error, MobileDesktopRadioButton, MobileOrDesktop, Preview } from '@toloka-tb/editor.preview';
import { OnboardingAnchor } from '@toloka-tb/common/components/Onboarding';
import { Button } from '@toloka-tb/common/components/Button';
import { reaction } from 'mobx';
import { useObserver } from 'mobx-react-lite';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { controller } from '../../sideEffect/controller';
import { appStore } from '../../store/appStore';
import { configStore, TbError } from '../../store/configStore';
import { featuresStore } from '../../store/features';
import { inputStore } from '../../store/inputStore';
import { intlStore } from '../../store/intlStore';
import { outputStore, previewStore, updatePreview } from '../../store/previewStore';
import { introOnboardingSteps } from '../Onboarding/Onboarding';
import styles from './Preview.less';

const eventually = <T extends any>(getValue: () => T, action: (value: Exclude<T, null | undefined>) => void) => {
    const initialValue = getValue();

    if (initialValue) action(initialValue as any);

    const dispose = reaction(getValue, (value) => {
        if (value) {
            action(value as any);
            dispose();
        }
    });
};

const goToErrorInEditor = (row: number, col: number, editor: 'config' | 'input') => {
    controller.setPaneOpen(editor, true);

    eventually(
        () => (editor === 'config' ? configStore.monaco : inputStore.monaco),
        (monaco) => {
            monaco.setPosition({
                column: col,
                lineNumber: row
            });
            monaco.focus();
            monaco.revealLineInCenter(row);
        }
    );
};

const getLocation = (error: TbError, editor: 'config' | 'input') => {
    if (error.location === undefined) return;

    const model = editor === 'config' ? configStore.monaco?.getModel() : inputStore.monaco?.getModel();

    if (!model) {
        const text = editor === 'config' ? configStore.current : inputStore.current;
        let position = 0;
        let line = 0;

        while (text.indexOf('\n', position) < error.location && text.indexOf('\n', position) > -1) {
            position = text.indexOf('\n', position) + 1;
            ++line;
        }

        return {
            lineNumber: line + 1, // monaco counts lines form 1
            column: error.location - position + 1 // monaco counts columns form 1
        };
    }

    return model.getPositionAt(error.location);
};

type WithOrigin = TbError & { origin: 'config' | 'input' };
const prepareError = (tbError: WithOrigin): Error => {
    const errorLocation = getLocation(tbError, tbError.origin);

    return {
        message: tbError.message,
        getLocation: () => ({ origin: tbError.origin, line: errorLocation?.lineNumber }),
        onClick: () => {
            if (errorLocation) {
                goToErrorInEditor(errorLocation.lineNumber, errorLocation.column, tbError.origin);
            }
        }
    };
};

export const PreviewPane = React.memo(() => {
    const ctx = useObserver(() => previewStore.ctx);
    const hasDebouncedUpdate = useObserver(() => appStore.hasDebouncedUpdate);
    const [t] = useTranslation();
    const [device, setDevice] = useState<MobileOrDesktop>(featuresStore.defaultDesktop ? 'DESKTOP' : 'MOBILE');

    const errors = useObserver(() => {
        const inputErrors: WithOrigin[] = inputStore.relevantErrors.map(
            (error) => ({ ...error, origin: 'input' } as const)
        );
        const configErrors: WithOrigin[] = configStore.relevantErrors.map(
            (error) => ({ ...error, origin: 'config' } as const)
        );

        const editorErrors = configErrors.length > 0 ? configErrors : inputErrors;
        const preparedErrors = editorErrors.map(prepareError);

        return preparedErrors.length > 0 ? preparedErrors : intlStore.errors;
    });

    const resetForm = React.useCallback(() => {
        updatePreview();
        controller.onPreviewReset();
    }, []);

    const submitForm = React.useCallback(() => {
        if (!ctx) return;

        const value = ctx.submit();

        if (ctx.isValid) {
            setValue(outputStore, value);
            controller.setPaneOpen('output', true);
        }
        controller.onPreviewSubmit();
    }, [ctx]);

    return (
        <Pane>
            <PaneTitle loading={hasDebouncedUpdate || !ctx} className={!hasDebouncedUpdate ? styles.paneTitle : ''}>
                {t('preview')}
                {!hasDebouncedUpdate && <MobileDesktopRadioButton defaultValue={device} onChange={setDevice} />}
            </PaneTitle>
            <PaneContent>
                <OnboardingAnchor name={introOnboardingSteps.preview} className={styles.paneContent}>
                    <Preview ctx={ctx} env={previewStore.env} onSubmit={submitForm} errors={errors} device={device} />
                </OnboardingAnchor>
            </PaneContent>
            <PaneFooter className={styles.footer}>
                <Button type="submit" size="s" view="pseudo" pin="round-brick" onClick={submitForm}>
                    {t('preview.submit')}
                </Button>
                <Button
                    size="s"
                    view="pseudo"
                    onClick={resetForm}
                    pin="clear-round"
                    disabled={!ctx || Object.keys(ctx.output.value).length === 0}
                >
                    {t('preview.reset')}
                </Button>
            </PaneFooter>
        </Pane>
    );
});

PreviewPane.displayName = 'PreviewPane';
