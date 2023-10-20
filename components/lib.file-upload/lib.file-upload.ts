import { Core, CreateOptions } from '@toloka-tb/core/coreComponentApi';
import { action, reaction, toJS } from 'mobx';
import React from 'react';

import { createAttachmentView } from './AttachmentView/AttachmentView';
export { createAttachmentView };

import { UploadItem, UploadsList } from '@toloka-tb/iframe-api';
export { UploadItem, UploadsList };

import translations from './i18n/lib.file-upload.translations';
export { translations };

type UploadId = string;

type DisposeSubscription = () => void;

export type FilesUploadEnvApi = {
    getFilesUploader: () => null | FileUploader;
};

type Options = Partial<{
    multiple: boolean;
    accept: string;
    capture: boolean;
    mobileLauncherSources: Array<'FILE_MANAGER' | 'GALLERY' | 'CAMERA' | 'MICROPHONE' | 'RECORDER' | 'CAMCORDER'>;
    requiredCoordinates: boolean;
}>;

export type FileUploader = {
    upload: (files: File[]) => UploadsList;
    browse: (dataPath: string, options?: Options) => Promise<UploadsList>;
    deleteUpload: (uploadId: UploadId) => void;
    getUploads: (uploadsIds: string[]) => UploadsList;
    restoreUploads: (uploadsIds: string[]) => UploadsList;
    onUploadsChange: (attachmentIds: string[], callback: (uploads: UploadsList) => void) => DisposeSubscription;
};

type State = {
    uploads: {
        [id: string]: UploadItem;
    };
};
const initState: State = {
    uploads: {}
};

const isUploadItemsEqual = (a: UploadItem, b: UploadItem) =>
    Object.entries(a).every(([key, value]) => b[key as keyof UploadItem] === value);

export const createUseFileUpload = (core: Core, options: CreateOptions) => {
    const { useComponentState } = core.hooks;
    const { useCtxBag } = core._lowLevel;
    const env = options.env as FilesUploadEnvApi;

    return (
        onChange: (ids: string[]) => void,
        value: string[],
        options?: Pick<Options, 'multiple'>
    ): [UploadsList, (files: File[]) => void, (id: string) => void, (options?: Omit<Options, 'multiple'>) => void] => {
        const filesUploader = React.useMemo(() => env.getFilesUploader && env.getFilesUploader(), []);

        const componentState = useComponentState<State>(initState);
        const ctxBag = useCtxBag();
        const dataPath = React.useMemo(() => ctxBag.component.data.getPath(ctxBag), [ctxBag]);

        React.useEffect(() => {
            if ((value || []).some((id) => !(id in componentState.uploads))) {
                if (!filesUploader) return;

                const uploads = filesUploader.restoreUploads(value);

                uploads.forEach((upload) => {
                    if (!componentState.uploads[upload.id]) {
                        componentState.uploads[upload.id] = upload;
                    }
                });
            }
        }, [componentState, filesUploader, value]);

        React.useEffect(() => {
            let disposeSubscription: () => void = () => ({});
            const disposeMobxReaction = reaction(
                () => Object.keys(componentState.uploads),
                (uploadsIds) => {
                    if (!filesUploader) return;
                    disposeSubscription();

                    const uploads = filesUploader.getUploads(uploadsIds);

                    const handleUpload = action((upload: UploadItem) => {
                        if (
                            !componentState.uploads[upload.id] ||
                            !isUploadItemsEqual(componentState.uploads[upload.id], upload)
                        ) {
                            componentState.uploads[upload.id] = upload;
                        }
                        if (upload.tmpId && componentState.uploads[upload.tmpId] && upload.id !== upload.tmpId) {
                            delete componentState.uploads[upload.tmpId];
                        }
                    });

                    uploads.forEach(handleUpload);

                    disposeSubscription = filesUploader.onUploadsChange(uploadsIds, (uploads) =>
                        uploads.forEach(handleUpload)
                    );
                },
                {
                    fireImmediately: true
                }
            );

            return () => {
                disposeSubscription();
                disposeMobxReaction();
            };
        }, [componentState.uploads, filesUploader]);

        React.useEffect(
            reaction(
                () => toJS(componentState.uploads, { recurseEverything: true }),
                () => {
                    const prevValue = value;

                    if (options && !options.multiple && Object.values(componentState.uploads).length >= 2) {
                        const mostRecentUpload = Object.values(componentState.uploads).reduce((mostRecent, current) =>
                            current.created >= mostRecent.created ? current : mostRecent
                        );

                        for (const uploadId in componentState.uploads) {
                            const upload = componentState.uploads[uploadId];

                            if (upload.state === 'success' && upload !== mostRecentUpload) {
                                delete componentState.uploads[uploadId];
                            }
                        }
                    }

                    const uploads = Object.values(componentState.uploads);

                    const nextValue = uploads
                        .filter(
                            (upload) =>
                                upload.state === 'success' ||
                                (upload.state === 'pending' && prevValue.includes(upload.id))
                        )
                        .map((upload) => upload.id);

                    const hasChanges =
                        prevValue.length !== nextValue.length ||
                        prevValue.some((value, index) => value !== nextValue[index]);

                    if (hasChanges) {
                        requestAnimationFrame(() => onChange(nextValue));
                    }
                },
                {
                    fireImmediately: true
                }
            ),
            [componentState, onChange, value, options]
        );

        const addFiles = React.useCallback(
            (files: File[]) => {
                if (!filesUploader) return;
                if (ctxBag.tb.isReadOnly) return;

                const newUploads = filesUploader.upload(files);

                newUploads.forEach((upload) => (componentState.uploads[upload.id] = upload));
            },
            [componentState.uploads, ctxBag.tb.isReadOnly, filesUploader]
        );

        const removeFile = React.useCallback(
            action((uploadId: string) => {
                if (!filesUploader) return;
                if (ctxBag.tb.isReadOnly) return;

                filesUploader.deleteUpload(uploadId);
                delete componentState.uploads[uploadId];
            }),
            [componentState.uploads, ctxBag.tb.isReadOnly, filesUploader]
        );

        const browseFiles = React.useCallback(
            (browseOptions?: Omit<Options, 'multiple'>) => {
                (async () => {
                    if (!filesUploader) return;
                    if (ctxBag.tb.isReadOnly) return;

                    const { multiple, accept, capture, mobileLauncherSources, requiredCoordinates } = {
                        ...(options || {}),
                        ...(browseOptions || {})
                    };

                    const newUploads = await filesUploader?.browse(dataPath, {
                        multiple,
                        accept,
                        capture,
                        mobileLauncherSources,
                        requiredCoordinates
                    });

                    newUploads.forEach((upload) => (componentState.uploads[upload.id] = upload));
                })();
            },
            [componentState.uploads, ctxBag.tb.isReadOnly, dataPath, filesUploader, options]
        );

        return [Object.values(componentState.uploads), addFiles, removeFile, browseFiles];
    };
};
