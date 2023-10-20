export const retryOnError = <T>(
    tryAgain: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (error: Error) => void,
    attempts: number,
    errorInfo: {
        name: string;
        url: string;
    }
) => (event: string | Event) => {
    if (attempts < 3) {
        setTimeout(
            () =>
                tryAgain()
                    .then(resolve)
                    .catch(reject),
            attempts * 1000
        );
    } else {
        const error = typeof event === 'string' ? new Error(`${event}|${errorInfo.url}`) : new Error(errorInfo.url);

        error.name = errorInfo.name;

        reject(error);
        throw error;
    }
};

export const loadScript = (url: string, arg: 'async' | 'defer', crossorigin?: 'crossorigin', attempts = 0) =>
    new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.onload = resolve;
        script.onerror = retryOnError(
            () => loadScript(url, arg, crossorigin, attempts + 1),
            resolve,
            reject,
            attempts,
            { name: 'TB_SCRIPT_LOADING_ERROR', url }
        );

        script.src = url;

        if (arg === 'async') {
            script[arg] = true;
        } else {
            script.async = false;
            script.defer = true;
        }

        script.charset = 'UTF-8';

        if (crossorigin) {
            script.crossOrigin = 'crossorigin';
        }

        document.getElementsByTagName('head')[0].appendChild(script);
    });
