import React from 'react';
import cx from 'classnames';
import { Button } from '../Button';
import { Popover } from '../Popover';
import { OnboardingContext, onboardingContext } from './context';
import './Onboarding.css';
import { PopoverProps } from '../Popover';

type AnyRef = React.RefObject<any>;

export type OnboardingAnchorProps = {
    name: string;
    anchorRef?: AnyRef;
    className?: string;
    preferedPositon?: PopoverProps['position'];
};

const useCache: <T>(getValue: () => T, needValueUpdate: (value: T) => boolean) => T = (getValue, needValueUpdate) => {
    const value = React.useMemo(() => getValue(), [getValue]);
    const updateValue = React.useMemo(() => needValueUpdate(value), [needValueUpdate, value]);
    const [cache, setCache] = React.useState(value);
    React.useEffect(() => {
        if (updateValue) {
            setCache(value);
        }
    }, [updateValue, value]);

    return cache;
};

const useOnboardingContext = (anchorName: string) => {
    const context = React.useContext(onboardingContext);
    const onboarding = useCache(
        () => context.onboarding,
        context => context !== undefined,
    );
    const steps = React.useMemo(() => onboarding?.steps || [], [onboarding]);
    const stepIndex = React.useMemo(() => steps.findIndex(step => step.anchorName === anchorName), [anchorName, steps]);

    const isSingleStep = React.useMemo(() => steps.length === 1, [steps.length]);
    const isFirstStep = React.useMemo(() => steps[0] && steps[0].anchorName === anchorName, [anchorName, steps]);
    const isLastStep = React.useMemo(
        () => steps[steps.length - 1] && steps[steps.length - 1].anchorName === anchorName,
        [anchorName, steps],
    );
    const position = React.useMemo(() => {
        if (isSingleStep) return 'single';
        if (isFirstStep) return 'start';
        if (isLastStep) return 'end';

        return 'middle';
    }, [isFirstStep, isLastStep, isSingleStep]);

    const data = React.useMemo(() => steps.find(step => step.anchorName === anchorName), [anchorName, steps]);
    const isCurrentStep = React.useMemo(() => context.anchor === anchorName, [anchorName, context.anchor]);
    const visible = React.useMemo(() => Boolean(data && isCurrentStep), [data, isCurrentStep]);

    const meta = React.useMemo<Pick<OnboardingContext, 'translate' | 'locale' | 'actions'>>(
        () => ({
            translate: context.translate,
            locale: context.locale,
            actions: context.actions,
        }),
        [context.actions, context.locale, context.translate],
    );

    return {
        meta,
        data,
        stepsCount: steps.length,
        stepIndex,
        visible,
        position,
    };
};

export const OnboardingAnchor: React.FC<OnboardingAnchorProps> = ({
    name,
    children,
    anchorRef,
    className: anchorClassName,
    preferedPositon,
}) => {
    const { meta, stepIndex, stepsCount, position, visible, data } = useOnboardingContext(name);

    const stepString = React.useMemo(() => meta.locale.step(stepIndex + 1, stepsCount), [
        meta.locale,
        stepIndex,
        stepsCount,
    ]);

    const nextBtnText = React.useMemo(() => {
        if (position === 'single') return meta.locale.close;
        if (position === 'end') return meta.locale.complete;
        return meta.locale.next;
    }, [meta.locale.close, meta.locale.complete, meta.locale.next, position]);

    return (
        <Popover
            visible={visible}
            anchorRef={anchorRef}
            anchorClassName={anchorClassName}
            arrowClassName={'cc-onboarding-popover__arrow'}
            className={'cc-onboarding-popover'}
            position={preferedPositon}
            onRequestClose={() => meta.actions.close('aborted')}
            arrowSize={16}
            content={
                <>
                    {data?.imageUrl && (
                        <div className="cc-onboarding-popover__image-wrapper">
                            <img className="cc-onboarding-popover__image" aria-hidden src={data.imageUrl} />
                        </div>
                    )}
                    <div>
                        <div className="cc-onboarding-popover__title">
                            <strong>{meta.translate(data?.title)}</strong>
                            <div className="cc-onboarding-popover__step">{stepString}</div>
                        </div>
                        <div className="cc-onboarding-popover__content">{meta.translate(data?.content)}</div>
                        <div className="cc-onboarding-popover__buttons">
                            <Button
                                view="action"
                                className={cx('cc-onboarding-popover__button', 'cc-onboarding-popover__button-next')}
                                onClick={meta.actions.next}
                            >
                                {nextBtnText}
                            </Button>
                            {position !== 'single' && (
                                <Button
                                    view="clear"
                                    onClick={() =>
                                        meta.actions.close('aborted')
                                    }
                                    className={cx(
                                        'cc-onboarding-popover__button',
                                        'cc-onboarding-popover__button-abort',
                                    )}
                                >
                                    {meta.locale.skip}
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            }
        >
            {children}
        </Popover>
    );
};
