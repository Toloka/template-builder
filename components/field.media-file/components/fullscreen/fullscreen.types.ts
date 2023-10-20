import { UseTranslation } from '@toloka-tb/core/api/i18n';
import { createAttachmentView } from '@toloka-tb/lib.file-upload';

import { TypedUploadItem } from '../../hooks/useTypedItems';
import translations from '../../i18n/field.media-file.translations';

export interface FullscreenProps {
    items: TypedUploadItem[];
    AttachmentView: ReturnType<typeof createAttachmentView>;
    t: ReturnType<UseTranslation<keyof typeof translations.ru>>;
    isOpen: boolean;
    onClose: () => void;
}
