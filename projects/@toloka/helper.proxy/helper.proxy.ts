import { Core } from '@toloka-tb/core/coreComponentApi';

const type = '@toloka/helper.proxy';

export type HelperProxyProps = {
    path: string;
};

export type TolokaProxyEnvApi = { getTolokaProxiedUrl: (url: string) => string };

export const create = (core: Core, options: { env: TolokaProxyEnvApi }) => {
    const getTolokaProxiedUrl = options.env.getTolokaProxiedUrl;

    return {
        type,
        compile: core.helpers.helper<HelperProxyProps, string>(({ path }) => getTolokaProxiedUrl(path))
    };
};
