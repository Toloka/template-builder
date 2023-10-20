import React from 'react';
import { OnboardingBody } from './Provider';

export type OnboardingStep = {
    anchorName: string;
    title: string;
    content: string;
    imageUrl?: string;
};

export type OnboardingLocale = {
    next: string;
    close: string;
    skip: string;
    complete: string;
    step: (current: number, total: number) => string;
};

export type OnboardingContext = {
    onboarding: OnboardingBody | undefined;
    anchor: string | undefined;
    steps: OnboardingStep[];
    actions: {
        next: () => void;
        close: (status: 'completed' | 'aborted') => void;
    };
    locale: OnboardingLocale;
    translate: <Key extends string | undefined>(key: Key) => Key;
};

export const defaultOnboardingContext: OnboardingContext = {
    onboarding: undefined,
    anchor: undefined,
    steps: [],
    actions: {
        next: () => {},
        close: () => {},
    },
    locale: {
        next: 'Next',
        close: 'Close',
        complete: 'Complete',
        skip: 'Skip',
        step: (current, total) => `${current} of ${total}`,
    },
    translate: key => key,
};

export const onboardingContext = React.createContext<OnboardingContext>(defaultOnboardingContext);
