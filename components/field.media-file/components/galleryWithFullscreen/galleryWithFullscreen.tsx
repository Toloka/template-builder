import { observer } from 'mobx-react-lite';
import React, { useCallback, useState } from 'react';

import { TypedUploadItem, useTypedItems } from '../../hooks/useTypedItems';
import { checkImgUrl } from '../../utils/checkImgUrl';
import { Fullscreen } from '../fullscreen/fullscreen';
import { Gallery } from '../gallery/gallery';
import { GalleryWithFullscreenProps } from './galleryWithFullscreen.types';

export const GalleryWithFullscreen: React.FC<GalleryWithFullscreenProps> = observer(
    ({ items, AttachmentView, t, isFullscreenOpened, toggleFullscreen }) => {
        const [hasOriginals, setHasOriginals] = useState<boolean | undefined>(undefined);
        const afterType = useCallback((typedItems: TypedUploadItem[]) => {
            const imgWithUrl = typedItems.find((item) => item.type === 'image' && item.downloadUrl);

            if (typedItems.length && !imgWithUrl) {
                setHasOriginals(false);
            }

            // Second check required for TS
            if (!imgWithUrl || !imgWithUrl.downloadUrl) {
                return;
            }

            setHasOriginals(undefined);

            checkImgUrl(imgWithUrl.downloadUrl)
                .then(() => setHasOriginals(true))
                .catch(() => setHasOriginals(false));
        }, []);
        const typedItems = useTypedItems(items, afterType);

        const loaded =
            // No initial items
            !items.length ||
            // Or all items are typed and gallery type defined
            (items.length === typedItems.length &&
                typedItems.every((item) => item.type) &&
                typeof hasOriginals === 'boolean');

        return (
            <>
                {
                    <Gallery
                        t={t}
                        AttachmentView={AttachmentView}
                        items={typedItems}
                        toggleFullscreen={toggleFullscreen}
                        loaded={loaded}
                        hasOriginals={hasOriginals}
                    />
                }
                {toggleFullscreen && hasOriginals && (
                    <Fullscreen
                        isOpen={isFullscreenOpened}
                        onClose={toggleFullscreen}
                        t={t}
                        AttachmentView={AttachmentView}
                        items={typedItems}
                    />
                )}
            </>
        );
    }
);
