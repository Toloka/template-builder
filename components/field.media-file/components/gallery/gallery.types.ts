import { UseTranslation } from '@toloka-tb/core/api/i18n';
import { createAttachmentView } from '@toloka-tb/lib.file-upload';

import { TypedUploadItem } from '../../hooks/useTypedItems';
import translations from '../../i18n/field.media-file.translations';

export interface GalleryProps {
    items: TypedUploadItem[];
    AttachmentView: ReturnType<typeof createAttachmentView>;
    t: ReturnType<UseTranslation<keyof typeof translations.ru>>;
    toggleFullscreen?: () => void;
    mode?: 'block' | 'fullscreen';
    withZoom?: boolean;
    loaded: boolean;
    hasOriginals?: boolean;
}
