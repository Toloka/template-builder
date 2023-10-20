import { UploadItem } from '@toloka-tb/lib.file-upload';
import { useEffect, useState } from 'react';

export type UploadItemType = 'image' | 'video' | 'unknown' | 'file';

interface AdditionalInfo {
    type?: UploadItemType;
    filename?: string;
    downloadUrl?: string;
}

const UNKNOWN_TYPE: AdditionalInfo = { type: 'unknown' };

export type TypedUploadItem = UploadItem & AdditionalInfo;

const requestMap: Record<string, Promise<AdditionalInfo>> = {};
const typeMap: Record<string, AdditionalInfo> = {};

// @see https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types#common_image_file_types
const imageMimeTypes = [
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp'
];

const getTypeByContentType = (contentType: string | null): UploadItemType => {
    let type: UploadItemType = 'file';

    if (imageMimeTypes.some((type) => contentType?.startsWith(type))) {
        type = 'image';
    } else if (contentType?.startsWith('video')) {
        type = 'video';
    }

    return type;
};

const getNameByContentDisposition = (contentDisposition: string | null): string | undefined => {
    return contentDisposition
        ?.split(';')
        .find((part) => part.trim().startsWith('filename'))
        ?.split('=')[1];
};

const getUrlByOriginalUrl = (infoUrl: string, originalUrlHeader: string | null): string | undefined => {
    if (!originalUrlHeader) {
        return undefined;
    }

    const { origin } = new URL(infoUrl);

    return origin + originalUrlHeader;
};

const getAdditionalInfoByUrl = (url: string): Promise<AdditionalInfo> => {
    return fetch(url, {
        method: 'HEAD',
        credentials: 'include',
        mode: 'cors',
        headers: { 'X-Original-Attachment-URL': 'unknown' }
    })
        .then((res) => {
            if (!res.ok) {
                return UNKNOWN_TYPE;
            }

            const type: AdditionalInfo = {
                type: getTypeByContentType(res.headers.get('content-type')),
                filename: getNameByContentDisposition(res.headers.get('content-disposition'))
            };
            const downloadUrl = getUrlByOriginalUrl(url, res.headers.get('x-original-attachment-url'));

            if (downloadUrl) {
                type.downloadUrl = downloadUrl;
            }

            return type;
        })
        .catch(() => UNKNOWN_TYPE);
};

const getAdditionalInfoByImg = (url?: string): Promise<AdditionalInfo> => {
    if (!url) {
        return Promise.resolve(UNKNOWN_TYPE);
    }

    return new Promise((res) => {
        const img = new Image();

        img.onerror = () => {
            res(UNKNOWN_TYPE);
            img.remove();
        };
        img.onload = () => {
            res({ type: 'image' });
            img.remove();
        };

        img.src = url;
    });
};

const getType = async (item: UploadItem): Promise<AdditionalInfo> => {
    const imageKey = item.id;

    if (item.state !== 'success') {
        return UNKNOWN_TYPE;
    }

    if (imageKey in typeMap) {
        return typeMap[imageKey];
    }

    if (imageKey in requestMap) {
        return await requestMap[imageKey];
    }

    requestMap[imageKey] = item.typeUrl
        ? getAdditionalInfoByUrl(item.typeUrl).then((result) =>
              result.type === 'unknown' ? getAdditionalInfoByImg(item.previewUrl) : result
          )
        : getAdditionalInfoByImg(item.previewUrl);

    typeMap[imageKey] = await requestMap[imageKey];

    return typeMap[imageKey];
};

const sameByKeys = <T>(a: T, b: T, keys: Array<keyof T>) => keys.every((key) => a[key] === b[key]);
const typingQueue: Record<string, Symbol> = {};

export const useTypedItems = (
    items: UploadItem[],
    afterType?: (items: TypedUploadItem[]) => void
): TypedUploadItem[] => {
    const [typedItems, changeTypedItems] = useState<TypedUploadItem[]>([]);

    useEffect(() => {
        let isMounted = true;

        if (!items.every((item) => item.state === 'success')) {
            return;
        }
        if (
            items.length === typedItems.length &&
            items.every((item, i) => sameByKeys(item, typedItems[i], ['id', 'state', 'previewUrl', 'typeUrl']))
        ) {
            return;
        }

        if (typedItems.length > 0) {
            changeTypedItems([]);
        }

        const queueKey = items.map((item) => item.id).join();
        const iterationSymbol = Symbol();

        typingQueue[queueKey] = iterationSymbol;

        Promise.all(items.map(getType)).then((itemsTypes) => {
            if (typingQueue[queueKey] !== iterationSymbol || !isMounted) {
                return;
            }

            const newTypedItems = itemsTypes.map((type, i) => ({
                ...items[i],
                ...type
            }));

            changeTypedItems(newTypedItems);

            if (afterType) {
                afterType(newTypedItems);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [items, typedItems, afterType]);

    return typedItems;
};
