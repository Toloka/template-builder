import { Core } from '@toloka-tb/core/coreComponentApi';

import translations from './i18n/lib.media-view.translations';
import { createMediaError } from './MediaLayout/MediaError';
import { MediaLayout, MediaLayoutProps } from './MediaLayout/MediaLayout';
import { ScrollEnvApi, useLazyLoad } from './useLazyLoad';

export { MediaLayoutProps, useLazyLoad, ScrollEnvApi };
export { translations };

export const create = (core: Core) => {
    return {
        MediaLayout,
        MediaError: createMediaError(core)
    };
};
