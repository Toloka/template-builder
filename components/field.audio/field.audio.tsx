import { Core, CreateOptions, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { createAttachmentView, createUseFileUpload } from '@toloka-tb/lib.file-upload';
import cx from 'classnames';
import { MicrophoneFilledIcon } from '@toloka-tb/common/icons/crowd/MicrophoneFilled';
import * as React from 'react';
import Dropzone from 'react-dropzone';

import styles from './field.audio.less';
import translations from './i18n/field.audio.translations';

const type = 'field.audio';

type DropzoneProps = { multiple: boolean; addFiles: (uploads: File[]) => void };

const DropzoneWrapper: React.FC<DropzoneProps> = ({ multiple = false, addFiles, children }) => {
    const preventDefaultEvent = React.useCallback((event: React.MouseEvent) => event.preventDefault(), []);

    return (
        <Dropzone noClick={true} onDrop={addFiles} multiple={multiple} accept="audio/*">
            {({ getRootProps, getInputProps }) => (
                <section className={styles.container}>
                    <div {...getRootProps({ className: styles.dropzone })}>
                        <div>
                            <input {...getInputProps()} accept={`audio/*`} onClick={preventDefaultEvent} />
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
    const getPlatform = options.env.getPlatform || (() => 'unknown');
    const { useCtxBag } = core._lowLevel;

    return {
        type,
        compile: core.helpers.field<{ multiple: boolean } & FieldProps<string | string[]>>(
            type,
            ({ onChange, multiple = false, value }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);
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

                const makeAudio = React.useCallback(() => {
                    browseFiles({ accept: 'audio/*', mobileLauncherSources: ['RECORDER'] });
                }, [browseFiles]);

                const onRemove = React.useCallback(
                    (uploadId: string) => {
                        if (ctxBag.tb.isReadOnly) return;

                        return () => removeFile(uploadId);
                    },
                    [ctxBag.tb.isReadOnly, removeFile]
                );

                return (
                    <div>
                        <div className={cx(styles.dropzoneContainer)}>
                            <div onClick={makeAudio} className={styles.dropZonePart}>
                                <DropzoneWrapper addFiles={addFiles} multiple={multiple}>
                                    <MicrophoneFilledIcon className={styles.uploadIcon} />
                                    {t('recordAudio')}
                                </DropzoneWrapper>
                            </div>
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
                                        mode={getPlatform() === 'desktop' ? 'audio' : undefined}
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
