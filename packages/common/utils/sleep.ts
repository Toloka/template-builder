export type SleepPromise = Promise<unknown> & { awake: () => void; cancel: (reason?: unknown) => void };

export const sleep = (time: number): SleepPromise => {
    let resolveHandler: () => void;
    let rejectHandler: (reason?: unknown) => void;
    let timerId: number;
    const awake = () => {
        timerId && clearTimeout(timerId);
        resolveHandler();
    };
    let cancel = (reason?: unknown) => {
        rejectHandler(reason);
    };
    const timer = new Promise((resolve, reject) => {
        if (time !== Infinity) {
            // @ts-ignore Web's timer-id not equal to NODE's timer-id
            timerId = setTimeout(resolve, time);
        }
        resolveHandler = resolve;
        rejectHandler = reject;
    });

    return Object.assign(timer, { awake, cancel });
};
