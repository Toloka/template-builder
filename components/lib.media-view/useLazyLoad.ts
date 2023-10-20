/* eslint-disable react-hooks/rules-of-hooks */
import { useInView } from 'react-intersection-observer';

export type ScrollEnvApi = { getScrollRoot?: () => HTMLElement | null };

export const useLazyLoad = (env?: ScrollEnvApi): [ReturnType<typeof useInView>[0], boolean] => {
    if ('IntersectionObserver' in window) {
        const [mediaLayoutRef, wasCloseEnough] = useInView({
            rootMargin: `${window.innerHeight * 1.5}px`,
            root: env && env.getScrollRoot && env.getScrollRoot(),
            triggerOnce: true
        });

        return [mediaLayoutRef, wasCloseEnough];
    } else {
        const stubRef: (node?: Element | null) => void = () => undefined;

        return [stubRef, true];
    }
};
