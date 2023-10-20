import React from 'react';

const observerContainer: { resizeObserver: ResizeObserver | null } = {
    resizeObserver: null
};

type ResizeCallback = (rect: { width: number; height: number }) => void;
const subscribers: Map<Element, ResizeCallback[]> = new Map();

const handleResize = (entries: ResizeObserverEntry[]) => {
    for (const entry of entries) {
        const entrySubscribers = subscribers.get(entry.target);

        if (entrySubscribers) {
            entrySubscribers.forEach((cb) => cb(entry.contentRect));
        }
    }
};

const subscribe = (el: Element, cb: ResizeCallback) => {
    const elSubscribers = subscribers.get(el);

    if (elSubscribers) {
        elSubscribers.push(cb);
    } else {
        subscribers.set(el, [cb]);
    }
    if (observerContainer.resizeObserver === null) {
        observerContainer.resizeObserver = new ResizeObserver(handleResize);
    }

    if (observerContainer.resizeObserver) {
        observerContainer.resizeObserver.observe(el);
    }
};

const unsubscribe = (el: Element, cb: ResizeCallback) => {
    const elSubscribers = subscribers.get(el);

    if (elSubscribers) {
        elSubscribers.splice(elSubscribers.indexOf(cb), 1);
    }

    if (observerContainer.resizeObserver) {
        observerContainer.resizeObserver.unobserve(el);
    }
};

if (window.ResizeObserver === undefined) {
    type ROPolyfillCallback = (entries: Array<{ target: HTMLElement; contentRect: ClientRect }>) => void;
    (window as any).ResizeObserver = class ResizeObserverPolyfill {
        constructor(callback: ROPolyfillCallback) {
            this.entries = new Set();
            this.callback = callback;
            window.addEventListener('resize', this.reportResize.bind(this));
        }

        callback: ROPolyfillCallback;
        entries: Set<HTMLElement>;
        reportResize() {
            const entries = Array.from(this.entries);

            this.callback(
                entries.map((target) => ({
                    target,
                    contentRect: target.getBoundingClientRect()
                }))
            );
        }
        unobserve(htmlNode: HTMLElement) {
            this.entries.delete(htmlNode);
        }
        observe(htmlNode: HTMLElement) {
            this.entries.add(htmlNode);
            this.reportResize();
        }
    };
}

export const useResizeObserver = <El extends HTMLElement>(callback: ResizeCallback, dependencies: unknown[]) => {
    const ref = React.useRef<El>(null);

    React.useEffect(() => {
        const node = ref.current;

        if (node !== null) {
            subscribe(node, callback);

            return () => unsubscribe(node, callback);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref.current, ...dependencies]);

    return ref;
};
