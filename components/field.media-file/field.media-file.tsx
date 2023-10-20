import { create as createOpenClose } from '@toloka-tb/action.open-close';
import { Core, CreateOptions, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { createAttachmentView, createUseFileUpload } from '@toloka-tb/lib.file-upload';
import { createUseSyncFullscreen } from '@toloka-tb/lib.fullscreen';
import { CameraOutline } from '@yandex/ui-icons/CameraOutline';
import { CameraVideoOutline } from '@yandex/ui-icons/CameraVideoOutline';
import { FolderOutline } from '@yandex/ui-icons/FolderOutline';
import cx from 'classnames';
import * as React from 'react';
import Dropzone from 'react-dropzone';

import { LazyGallery } from './components/lazy-gallery/lazy-gallery';
import styles from './field.media-file.less';
import translations from './i18n/field.media-file.translations';
import { GridFlexOutlineIcon } from './icons/grid-flex-outline-icon';

type FieldMediaFileProps = {
    accept?: {
        photo?: boolean;
        video?: boolean;
        gallery?: boolean;
        fileSystem?: boolean;
    };
    requiredCoordinates?: boolean;
    multiple?: boolean;
};

const type = 'field.media-file';

const ACCEPTS_VIDEO = 'video/*;capture=camcorder';

type DropzoneProps = { multiple: boolean; addFiles: (uploads: File[]) => void };

const DropzoneWrapper: React.FC<DropzoneProps> = ({ multiple = false, addFiles, children }) => {
    const preventDefaultEvent = React.useCallback((event: React.MouseEvent) => event.preventDefault(), []);

    return (
        <Dropzone noClick={true} onDrop={addFiles} multiple={multiple} accept="image/*">
            {({ getRootProps, getInputProps }) => (
                <section className={styles.container}>
                    <div {...getRootProps({ className: styles.dropzone })}>
                        <div>
                            <input {...getInputProps()} accept="image/*" onClick={preventDefaultEvent} />
                            <p className={styles.label}>{children}</p>
                        </div>
                    </div>
                </section>
            )}
        </Dropzone>
    );
};

const defaultInitState = {
    isOpen: false
};

export const create = (core: Core, createOptions: CreateOptions) => {
    const useFileUpload = createUseFileUpload(core, createOptions);
    const AttachmentView = createAttachmentView(core);
    const { useCtxBag } = core._lowLevel;
    const { useResizeObserver } = core.hooks;
    const openClose = createOpenClose(core).compile;
    const useSyncFullscreen = createUseSyncFullscreen(core, createOptions, openClose);

    return {
        type,
        compile: core.helpers.field<FieldMediaFileProps & FieldProps<string | string[]>>(
            type,
            ({ onChange, multiple = false, requiredCoordinates = false, accept, value }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);
                const state = core.hooks.useComponentState(defaultInitState);

                // TODO: TOLOKAFRONT-2696 move to subcomponent and run only when gallery is available
                const [isFullscreenOpened, toggleFullscreen] = useSyncFullscreen(state.isOpen);

                const handleChange = React.useCallback(
                    (value: string[]) => {
                        if (multiple) {
                            onChange(value);
                        } else {
                            onChange(value[0]);
                        }
                    },
                    [multiple, onChange]
                );

                const normalizedValue = React.useMemo(
                    () => (Array.isArray(value) ? value : ([value].filter(Boolean) as string[])),
                    [value]
                );

                const options = React.useMemo(() => ({ multiple }), [multiple]);

                const [uploads, addFiles, removeFile, browseFiles] = useFileUpload(
                    handleChange,
                    normalizedValue,
                    options
                );
                const ctxBag = useCtxBag();

                const makePhoto = React.useCallback(() => {
                    browseFiles({ accept: 'image/*', mobileLauncherSources: ['CAMERA'], requiredCoordinates });
                }, [browseFiles, requiredCoordinates]);
                const makeVideo = React.useCallback(() => {
                    browseFiles({ accept: ACCEPTS_VIDEO, mobileLauncherSources: ['CAMERA'], requiredCoordinates });
                }, [browseFiles, requiredCoordinates]);
                const browseGallery = React.useCallback(() => {
                    browseFiles({ accept: '*/*', mobileLauncherSources: ['GALLERY'], requiredCoordinates });
                }, [browseFiles, requiredCoordinates]);
                const browseFileSystem = React.useCallback(() => {
                    browseFiles({ accept: '*/*', mobileLauncherSources: ['FILE_MANAGER'], requiredCoordinates });
                }, [browseFiles, requiredCoordinates]);

                const onRemove = React.useCallback(
                    (uploadId: string) => {
                        if (ctxBag.tb.isReadOnly) return;

                        return () => removeFile(uploadId);
                    },
                    [ctxBag.tb.isReadOnly, removeFile]
                );

                const minWidth = React.useMemo(() => Math.max(Object.keys(accept || {}).length, 1) * 180, [accept]);
                const [underBreakpoint, setUnderBreakpoint] = React.useState(window.innerWidth <= minWidth);
                const resizeObserverRef = useResizeObserver<HTMLDivElement>(
                    ({ width }) => {
                        setUnderBreakpoint(width <= minWidth);
                    },
                    [minWidth]
                );

                if (ctxBag.tb.isReadOnly) {
                    return (
                        <LazyGallery
                            options={createOptions}
                            ctxBag={ctxBag}
                            items={uploads}
                            AttachmentView={AttachmentView}
                            t={t}
                            isFullscreenOpened={isFullscreenOpened}
                            toggleFullscreen={
                                createOptions.env.isFullscreenAvailable?.() ? toggleFullscreen : undefined
                            }
                        />
                    );
                }

                return (
                    <div>
                        <div
                            ref={resizeObserverRef}
                            className={cx(styles.dropzoneContainer, underBreakpoint && styles.dropzoneContainerCompact)}
                        >
                            {(!accept || accept.photo || Object.keys(accept).length === 0) && (
                                <div onClick={makePhoto} className={styles.dropZonePart}>
                                    <DropzoneWrapper addFiles={addFiles} multiple={multiple}>
                                        <CameraOutline className={styles.uploadIcon} />
                                        {t('takePhoto')}
                                    </DropzoneWrapper>
                                </div>
                            )}
                            {accept && accept.video && (
                                <div onClick={makeVideo} className={styles.dropZonePart}>
                                    <DropzoneWrapper addFiles={addFiles} multiple={multiple}>
                                        <CameraVideoOutline className={styles.uploadIcon} />
                                        {t('recordVideo')}
                                    </DropzoneWrapper>
                                </div>
                            )}
                            {accept && accept.gallery && (
                                <div onClick={browseGallery} className={styles.dropZonePart}>
                                    <DropzoneWrapper addFiles={addFiles} multiple={multiple}>
                                        <GridFlexOutlineIcon className={styles.uploadIcon} />
                                        {t('pickFromGallery')}
                                    </DropzoneWrapper>
                                </div>
                            )}
                            {accept && accept.fileSystem && (
                                <div onClick={browseFileSystem} className={styles.dropZonePart}>
                                    <DropzoneWrapper addFiles={addFiles} multiple={multiple}>
                                        <FolderOutline className={styles.uploadIcon} />
                                        {t('browseFileSystem')}
                                    </DropzoneWrapper>
                                </div>
                            )}
                        </div>

                        <div className={styles.thumbs}>
                            {uploads.map((upload) => (
                                <div className={styles.thumb} key={upload.id}>
                                    <AttachmentView
                                        preview={upload.previewUrl}
                                        name={upload.previewLabel}
                                        isProcessing={upload.state === 'pending' || upload.state === 'uploading'}
                                        failed={upload.state === 'failed'}
                                        progress={upload.progress}
                                        onRemove={onRemove(upload.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            },
            {
                transformers: [core.fieldTransformers.emptyArrayTransformer]
            }
        )
    };
};

export { translations };
