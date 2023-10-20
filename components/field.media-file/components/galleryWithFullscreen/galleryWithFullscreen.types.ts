import { UseTranslation } from '@toloka-tb/core/api/i18n';
import { createAttachmentView, UploadItem } from '@toloka-tb/lib.file-upload';

import translations from '../../i18n/field.media-file.translations';

export interface GalleryWithFullscreenProps {
    items: UploadItem[];
    AttachmentView: ReturnType<typeof createAttachmentView>;
    t: ReturnType<UseTranslation<keyof typeof translations.ru>>;
    isFullscreenOpened: boolean;
    toggleFullscreen?: () => void;
}
