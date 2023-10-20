/* eslint-disable no-cyrillic-string/no-cyrillic-string */
import { Core, CreateOptions, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { createAttachmentView, createUseFileUpload } from '@toloka-tb/lib.file-upload';
import { FolderOutlineIcon } from '@toloka-tb/common/icons/crowd/FolderOutline';
import * as React from 'react';
import Dropzone from 'react-dropzone';

import styles from './field.file.less';
import translations from './i18n/field.file.translations';

type FieldFileProps = {
    multiple: boolean;
    accept: string[];
};

const type = 'field.file';

type DropzoneProps = { multiple: boolean; accept: string | undefined; addFiles: (uploads: File[]) => void };

const DropzoneWrapper: React.FC<DropzoneProps> = ({ multiple = false, addFiles, children, accept }) => {
    const preventDefaultEvent = React.useCallback((event: React.MouseEvent) => event.preventDefault(), []);

    return (
        <Dropzone noClick={true} onDrop={addFiles} multiple={multiple} accept={accept}>
            {({ getRootProps, getInputProps }) => (
                <section className={styles.container}>
                    <div {...getRootProps({ className: styles.dropzone })}>
                        <div>
                            <input {...getInputProps()} accept={accept} onClick={preventDefaultEvent} />
                            <p className={styles.label}>{children}</p>
                        </div>
                    </div>
                </section>
            )}
        </Dropzone>
    );
};

export const create = (core: Core, options: CreateOptions) => {
    const useFileUpload = createUseFileUpload(core, options);
    const AttachmentView = createAttachmentView(core);
    const { useCtxBag } = core._lowLevel;

    return {
        type,
        compile: core.helpers.field<FieldFileProps & FieldProps<string | string[]>>(
            type,
            ({ onChange, multiple = false, accept, value }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);

                const acceptValue = accept || [];
                const ctxBag = useCtxBag();

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

                const handleClick = React.useCallback(
                    (event: React.MouseEvent | React.TouchEvent) => {
                        event.nativeEvent.stopImmediatePropagation();
                        event.stopPropagation();
                        browseFiles(acceptValue ? { accept: acceptValue.join(',') } : undefined);
                    },
                    [acceptValue, browseFiles]
                );

                const onRemove = React.useCallback(
                    (uploadId: string) => {
                        if (ctxBag.tb.isReadOnly) return;

                        return () => removeFile(uploadId);
                    },
                    [ctxBag.tb.isReadOnly, removeFile]
                );

                return (
                    <div>
                        <div className={styles.dropzoneContainer} onClick={handleClick}>
                            <DropzoneWrapper
                                accept={acceptValue.join(',') || undefined}
                                addFiles={addFiles}
                                multiple={multiple}
                            >
                                <FolderOutlineIcon className={styles.uploadIcon} /> {t('browseFiles')}
                            </DropzoneWrapper>
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
