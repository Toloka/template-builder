import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { FilesUploadEnvApi, FileUploader, UploadItem, UploadsList } from '@toloka-tb/lib.file-upload';

const linearFilter = <Item extends { id: string }>(requiredIds: string[], items: Item[]) => {
    if (!Array.isArray(requiredIds)) return [];
    if (!Array.isArray(items)) return [];

    const idsMap = requiredIds.reduce<{ [id: string]: true }>((map, id) => ({ [id]: true, ...map }), {});

    return items.filter((item) => idsMap[item.id]);
};

export const createFilesUploaderMock = () => {
    const state: { uploadsList: UploadsList; currentUploads: { [id: string]: { cancel: () => void } } } = {
        uploadsList: [],
        currentUploads: {}
    };
    const onChangeSubscribers: Array<() => void> = [];
    const triggerOnChangeSubscribers = () => {
        onChangeSubscribers.forEach((callback) => callback());
    };

    const uploader: FileUploader = {
        upload: (files) =>
            files.map((file) => {
                const id = uniqueId(`uploaded file "${file.name}" id will appear here – `);

                const upload: UploadItem = {
                    id,
                    state: 'pending',
                    previewUrl: '',
                    previewLabel: file.name,
                    progress: 0,
                    created: Date.now()
                };

                const reader = new FileReader();

                if (reader) {
                    reader.readAsDataURL(file);

                    const handleLoad = () => {
                        if (reader.result) {
                            upload.previewUrl = String(reader.result);
                            triggerOnChangeSubscribers();
                        }

                        reader.removeEventListener('load', handleLoad);
                    };

                    reader.addEventListener('load', handleLoad);
                }

                let currentProgressStep = 0;
                const progressSteps = 5;
                const stepInterval = 200;

                upload.progress = 0;
                upload.state = 'uploading';
                triggerOnChangeSubscribers();

                const interval = setInterval(() => {
                    currentProgressStep++;
                    upload.progress = currentProgressStep / progressSteps;

                    if (currentProgressStep >= progressSteps) {
                        upload.state = 'success';
                        delete state.currentUploads[id];
                        clearInterval(interval);
                    }

                    triggerOnChangeSubscribers();
                }, stepInterval);

                state.currentUploads[id] = {
                    cancel: () => {
                        clearInterval(interval);
                        delete state.currentUploads[id];
                        state.uploadsList.filter((upld) => upld !== upload);
                    }
                };

                state.uploadsList.push(upload);

                triggerOnChangeSubscribers();

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

            triggerOnChangeSubscribers();

            return result;
        },
        deleteUpload: (uploadId) => {
            if (state.currentUploads[uploadId]) {
                state.currentUploads[uploadId].cancel();
                delete state.currentUploads[uploadId];
                state.uploadsList = state.uploadsList.filter((upload) => upload.id !== uploadId);
            }

            triggerOnChangeSubscribers();
        },
        onUploadsChange: (uploadIds, callback) => {
            const subscriber = () => callback(linearFilter(uploadIds, state.uploadsList));

            onChangeSubscribers.push(subscriber);

            return () => onChangeSubscribers.splice(onChangeSubscribers.indexOf(subscriber), 1);
        },
        getUploads: (uploadIds) => linearFilter(uploadIds, state.uploadsList),
        restoreUploads: () => []
    };

    return uploader;
};

export { FilesUploadEnvApi };
