import { createAttachmentView } from '@toloka-tb/lib.file-upload';
import { RefObject } from 'react';

import { TypedUploadItem } from '../../hooks/useTypedItems';

export interface ThumbsListProps {
    innerRef?: RefObject<HTMLDivElement>;
    items: TypedUploadItem[];
    AttachmentView: ReturnType<typeof createAttachmentView>;
    mode?: 'gallery' | 'list' | 'fullscreen';
    direction?: 'column' | 'list';
}
