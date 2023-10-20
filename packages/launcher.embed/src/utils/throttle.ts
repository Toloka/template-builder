export const throttle = <Args extends any[]>(f: (...args: Args) => void, ms: number): ((...args: Args) => void) => {
    let lastArgs: Args | undefined;
    let timeout: ReturnType<typeof window.setTimeout> | undefined;

    const throttled = (...args: Args) => {
        if (timeout) {
            lastArgs = args;

            return;
        }

        f(...args);

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = undefined;
            if (lastArgs) {
                throttled(...lastArgs);
                lastArgs = undefined;
            }
        }, ms);
    };

    return throttled;
};
