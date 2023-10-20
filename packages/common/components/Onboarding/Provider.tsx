import React from 'react';
import {
    defaultOnboardingContext,
    OnboardingContext,
    onboardingContext,
    OnboardingStep,
    OnboardingLocale,
} from './context';

export type OnboardingBody = {
    onboardingName: string;
    steps: OnboardingStep[];
    initAnchor?: string;
};
export type OnboardingsSet = OnboardingBody[];

type SkipAnchors = {
    [anchorName: string]: boolean;
};
export type OnboardingProviderProps = {
    onboardings: OnboardingsSet;
    currentOnboarding?: string;
    locale?: Partial<OnboardingLocale>;
    onStepChange?: (anchorName: string) => void;
    onFinish?: (status: 'completed' | 'aborted') => void;
    translate?: <Key extends string | undefined>(key: Key) => Key;
    skipAnchors?: SkipAnchors;
};

const filterSteps = (steps: OnboardingBody['steps'], skipAnchors: SkipAnchors) =>
    steps.filter(({ anchorName }) => !skipAnchors[anchorName]);
const getInitAnchor = (onboarding: OnboardingBody, skipAnchors: SkipAnchors) => {
    if (onboarding.initAnchor && !skipAnchors[onboarding.initAnchor]) {
        return onboarding.initAnchor;
    }
    const steps = filterSteps(onboarding.steps, skipAnchors);

    return steps[0] ? steps[0].anchorName : undefined;
};

type State = {
    anchor: string | undefined;
    steps: OnboardingStep[];
    onboarding: OnboardingBody | undefined;
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
    currentOnboarding,
    children,
    onboardings,
    locale = defaultOnboardingContext.locale,
    onStepChange,
    onFinish,
    translate = defaultOnboardingContext.translate,
    skipAnchors,
}) => {
    const computeInitState = React.useCallback(
        (
            currentOnboarding: string | undefined,
            onboardings: OnboardingsSet,
            skipAnchors: SkipAnchors | undefined,
        ): State => {
            const onboarding = onboardings.find(onboarding => onboarding.onboardingName === currentOnboarding);
            const steps = onboarding ? filterSteps(onboarding.steps, skipAnchors || {}) : [];

            return {
                onboarding,
                steps,
                anchor: onboarding && getInitAnchor(onboarding, skipAnchors || {}),
            };
        },
        [],
    );
    const initState = React.useMemo(() => computeInitState(currentOnboarding, onboardings, skipAnchors), [
        currentOnboarding,
        computeInitState,
        onboardings,
        skipAnchors,
    ]);
    const stateReducer = React.useCallback(
        (
            state: State,
            action:
                | { type: 'set-anchor'; anchorName: string | undefined }
                | { type: 'set-onboarding'; onboarding: OnboardingBody | undefined }
                | { type: 'set-steps'; steps: OnboardingStep[] },
        ) => {
            switch (action.type) {
                case 'set-anchor':
                    return { ...state, anchor: action.anchorName };
                case 'set-onboarding':
                    return { ...state, onboarding: action.onboarding };
                case 'set-steps':
                    return { ...state, steps: action.steps };
                default:
                    return state;
            }
        },
        [],
    );
    const [state, dispatch] = React.useReducer(stateReducer, initState);

    React.useEffect(() => {
        const { onboarding, anchor, steps } = computeInitState(currentOnboarding, onboardings, skipAnchors);

        dispatch({ type: 'set-anchor', anchorName: anchor });
        dispatch({ type: 'set-onboarding', onboarding });
        dispatch({ type: 'set-steps', steps });
    }, [currentOnboarding, computeInitState, onboardings, skipAnchors]);

    const close = React.useCallback(
        (status: 'completed' | 'aborted' = 'aborted') => {
            if (!currentOnboarding) {
                return;
            }

            dispatch({ type: 'set-anchor', anchorName: undefined });
            dispatch({ type: 'set-onboarding', onboarding: undefined });

            if (onFinish) {
                onFinish(status);
            }
        },
        [currentOnboarding, onFinish],
    );
    const next = React.useCallback(() => {
        const { steps, onboarding } = state;

        if (!onboarding || !currentOnboarding) {
            return;
        }

        const stepIndex = steps.findIndex(step => step.anchorName === state.anchor);
        if (stepIndex === -1) {
            return;
        }

        const nextStep = steps[stepIndex + 1];

        if (nextStep) {
            dispatch({ type: 'set-anchor', anchorName: nextStep.anchorName });

            if (onStepChange) {
                onStepChange(nextStep.anchorName);
            }
        } else {
            close('completed');
        }
    }, [state, currentOnboarding, onStepChange, close]);

    const contextValue = React.useMemo<OnboardingContext>(
        () => ({
            onboarding: state.onboarding,
            anchor: state.anchor,
            steps: state.steps,

            locale: {
                ...defaultOnboardingContext.locale,
                ...locale,
            },
            actions: {
                next,
                close,
            },
            translate,
        }),
        [state.onboarding, state.anchor, state.steps, locale, next, close, translate],
    );

    return <onboardingContext.Provider value={contextValue}>{children}</onboardingContext.Provider>;
};
