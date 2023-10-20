import { CoreComponentApi } from '@toloka-tb/core/api/coreComponentApi';
import cx from 'classnames';
import { Progress } from '@toloka-tb/common/components/Progress';
import { Spin } from '@toloka-tb/common/components/Spin';
import { CloseOutlineIcon } from '@toloka-tb/common/icons/crowd/CloseOutline';
import { PauseFilledIcon } from '@toloka-tb/common/icons/crowd/PauseFilled';
import { PlayFilledIcon } from '@toloka-tb/common/icons/crowd/PlayFilled';
import React, { useMemo } from 'react';

import translations from '../i18n/lib.file-upload.translations';
import unknownAttach from './assets/unknownAttach.svg';
import styles from './AttachmentView.less';
import { getExtension, removeExtention } from './utils/getExtension';
import { getStylesForExtension } from './utils/getStylesForExtension';

type Props = {
    preview?: string;
    name: string;
    isProcessing?: boolean;
    selected?: boolean;
    onClick?: (url: string) => void;
    failed?: boolean;
    progress?: number;
    mode?: 'image' | 'audio';
    onRemove?: () => void;
    removeTitle?: boolean;
    additionalStyles?: {
        container?: string;
        attachment?: string;
        name?: string;
    };
};

const AudioHandler: React.FC<{ src: string }> = ({ src }) => {
    const [playing, setPlaying] = React.useState<'play' | 'pause'>('pause');
    const ref = React.useRef<HTMLAudioElement>(null);

    const synchoniuslyToggleAudioElementPlaying = React.useCallback((targetState: 'play' | 'pause') => {
        if (!ref.current) return;
        const audio = ref.current;

        if (targetState === 'play') {
            if (audio.paused) {
                audio.currentTime = 0;
                audio.volume = 1;
                audio.play();
            }
        } else {
            if (!audio.paused) {
                audio.pause();
            }
        }
    }, []);

    const togglePlaying = React.useCallback(() => {
        const oppositeState = ({ play: 'pause', pause: 'play' } as const)[playing];

        synchoniuslyToggleAudioElementPlaying(oppositeState);
        setPlaying(oppositeState);
    }, [playing, synchoniuslyToggleAudioElementPlaying]);

    React.useEffect(() => {
        if (!ref.current) return;
        const audio = ref.current;

        synchoniuslyToggleAudioElementPlaying(playing);

        const playEventListener = () => setPlaying('play');
        const pauseEventListener = () => setPlaying('pause');

        audio.addEventListener('play', playEventListener);
        audio.addEventListener('pause', pauseEventListener);

        return () => {
            audio.removeEventListener('play', playEventListener);
            audio.removeEventListener('pause', pauseEventListener);
        };
    }, [playing, synchoniuslyToggleAudioElementPlaying]);

    return (
        <>
            <audio src={src} controls={false} loop={false} ref={ref} />
            <div
                className={cx(styles.togglePlay, playing === 'play' && styles.togglePlayAlwaysVisible)}
                onClick={togglePlaying}
            >
                {playing === 'play' ? <PauseFilledIcon size="l" /> : <PlayFilledIcon size="l" />}
            </div>
        </>
    );
};

export const createAttachmentView = (core: CoreComponentApi): React.FC<Props> => ({
    name,
    mode = 'image',
    preview,
    isProcessing,
    progress,
    onRemove,
    failed,
    onClick,
    selected,
    additionalStyles,
    removeTitle
}) => {
    const t = core.i18n.useTranslation<keyof typeof translations.ru>('lib.file-upload');

    const canRemoveAttachment = Boolean(onRemove);

    const extension = getExtension(name);
    const shortName = removeExtention(name);

    const openPreviewUrl = React.useMemo(() => {
        if (mode === 'audio') return;
        if (typeof preview !== 'string') return;
        if (!(preview.startsWith('https://') || preview.startsWith('http://'))) return;
        if (canRemoveAttachment) return;

        return preview;
    }, [mode, canRemoveAttachment, preview]);
    const containerStyle = useMemo(
        () => (preview ? { backgroundImage: `url(${preview}), url(${unknownAttach})` } : undefined),
        [preview]
    );

    const clickHandler = React.useMemo(() => {
        if (typeof preview !== 'string') return;
        if (typeof onClick !== 'function') return;

        return () => onClick(preview);
    }, [onClick, preview]);

    const renderAttachment = () => {
        return (
            <>
                {isProcessing && (
                    <div className={styles.ticketAttachmentLoadingOverlay}>
                        {progress && progress !== 1 ? <Progress value={progress} /> : <Spin size="xxs" />}
                    </div>
                )}

                {mode === 'audio' && preview && <AudioHandler src={preview} />}

                <div>
                    {extension && !failed && (
                        <div className={styles.ticketAttachmentExtensionContainer}>
                            <span style={getStylesForExtension(extension)} className={styles.ticketAttachmentExtension}>
                                {extension}
                            </span>
                        </div>
                    )}
                    {failed && <div className={styles.uploadFailedLabel}>{t('errorOccurred')}</div>}
                </div>

                <div className={cx(styles.ticketAttachmentName, additionalStyles?.name)}>{shortName}</div>

                {canRemoveAttachment && (
                    <button
                        type="button"
                        className={styles.ticketAttachmentRemoveButton}
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove!();
                        }}
                    >
                        <CloseOutlineIcon color="#f0f2f3" />
                    </button>
                )}
            </>
        );
    };

    if (openPreviewUrl && !clickHandler) {
        return (
            <div className={cx(styles.ticketAttachmentContainer, additionalStyles?.container)}>
                <a
                    className={cx(
                        styles.ticketAttachment,
                        additionalStyles?.attachment,
                        failed && styles.ticketAttachmentFailed
                    )}
                    style={containerStyle}
                    title={name}
                    href={openPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {renderAttachment()}
                </a>
            </div>
        );
    }

    return (
        <div className={cx(styles.ticketAttachmentContainer, additionalStyles?.container)}>
            <div
                className={cx(
                    styles.ticketAttachment,
                    additionalStyles?.attachment,
                    failed && styles.ticketAttachmentFailed,
                    selected && styles.ticketAttachmentSelected
                )}
                style={containerStyle}
                title={removeTitle ? undefined : name}
                tabIndex={0}
                onClick={clickHandler}
            >
                {renderAttachment()}
            </div>
        </div>
    );
};
