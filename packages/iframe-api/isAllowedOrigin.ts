const TOLOKA_ORIGIN_REGEXP = /^https:\/\/([^.]+\.){1,5}(toloka-test|toloka)\.ai(:9001)*\/?$/

const isTolokaOrigin = (origin: string) => {
    return TOLOKA_ORIGIN_REGEXP.test(origin);
};

const isDevOrigin = (origin: string) => {
    const noPort = origin.replace(/:\d+$/, '');

    if (noPort.endsWith('127.0.0.1')) {
        return true;
    }

    if (noPort.endsWith('localhost')) {
        return true;
    }

    return false;
};

export const isAllowedOrigin = (origin: string) =>
    isTolokaOrigin(origin) ||
    isDevOrigin(origin);
