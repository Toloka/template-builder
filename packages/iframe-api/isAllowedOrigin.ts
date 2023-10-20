const isTolokaOrigin = (origin: string) => {
    const noPort = origin.replace(/:\d+$/, '');

    if (noPort.endsWith('toloka.ai')) {
        return true;
    }

    if (noPort.endsWith('toloka-test.ai')) {
        return true;
    }

    return false;
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
