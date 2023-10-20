import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { FileUploader, UploadItem, UploadsList } from '@toloka-tb/lib.file-upload';
import { reaction, toJS } from 'mobx';

import { Store } from './store';

const linearFilter = <Item extends { id: string }>(requiredIds: string[], items: Item[]) => {
    if (!Array.isArray(requiredIds)) return [];
    if (!Array.isArray(items)) return [];

    const idsMap = requiredIds.reduce<{ [id: string]: true }>((map, id) => ({ [id]: true, ...map }), {});

    return items.filter((item) => idsMap[item.id]);
};

export const createFilesUploader = (store: Store) => {
    const getUnknownUploads = (uploadIds: string[]): UploadsList => {
        const knownIds = Object.fromEntries(store.uploads.data.map(({ id }) => [id, true]));

        return uploadIds
            .filter((id) => !(id in knownIds))
            .map((id) => ({
                id,
                state: 'success',
                progress: 0,
                previewUrl: '',
                previewLabel: id,
                created: Date.now()
            }));
    };

    const uploader: FileUploader = {
        upload: (files) =>
            files.map((file) => {
                const id = uniqueId(`upload`);

                const upload: UploadItem = {
                    id,
                    state: 'success',
                    previewUrl: '',
                    previewLabel: file.name,
                    progress: 1,
                    created: Date.now()
                };

                const reader = new FileReader();

                if (reader) {
                    reader.readAsDataURL(file);

                    const handleLoad = () => {
                        if (reader.result) {
                            upload.previewUrl = String(reader.result);
                        }

                        reader.removeEventListener('load', handleLoad);
                    };

                    reader.addEventListener('load', handleLoad);
                }

                store.uploads.data.push(upload);
                store.uploads.files[id] = file;

                return upload;
            }),
        browse: async (_outputPath: string, options = {}) => {
            const result: UploadsList = [];

            const input = document.createElement('input');

            input.setAttribute('type', 'file');

            if (options.accept) {
                input.setAttribute('accept', options.accept);
            }
            if (options.multiple) {
                input.setAttribute('multiple', 'true');
            }
            if (options.capture) {
                input.setAttribute('capture', 'environment');
            }

            input.click();

            await new Promise((resolve) => {
                const filesPickListener = (event: Event) => {
                    const files = Array.from((<HTMLInputElement>event.target).files || []);

                    result.push(...uploader.upload(files));

                    input.removeEventListener('change', filesPickListener);
                    resolve(null);
                };

                input.addEventListener('change', filesPickListener);
            });

            return result;
        },
        deleteUpload: (uploadId) => {
            if (store.uploads) {
                store.uploads.data = store.uploads.data.filter((upload) => upload.id !== uploadId);
            }
        },
        onUploadsChange: (uploadIds, callback) =>
            reaction(() => toJS(linearFilter(uploadIds, store.uploads.data), { recurseEverything: true }), callback, {
                equals: (a, b) => JSON.stringify(a) === JSON.stringify(b)
            }),
        getUploads: (uploadIds) => [...linearFilter(uploadIds, store.uploads.data), ...getUnknownUploads(uploadIds)],
        restoreUploads: (uploadIds) => [...linearFilter(uploadIds, store.uploads.data), ...getUnknownUploads(uploadIds)]
    };

    return uploader;
};
