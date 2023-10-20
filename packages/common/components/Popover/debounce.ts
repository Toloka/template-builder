export const debounce = <T extends Function>(cb: T, wait = 20) => {
    let timeout = 0;
    const callable = (...args: any) => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => cb(...args), wait);
    };

    return <T>(<any>callable);
};
