import { Slider as RangePicker } from '@yandex/ui/Slider/desktop/bundle';
import cx from 'classnames';
import React, { useCallback } from 'react';

import { DownloadIcon } from '../../icons/download-icon';
import { ExitFullscreenIcon } from '../../icons/exit-fullscreen-icon';
import { FullscreenIcon } from '../../icons/fullscreen-icon';
import { MinusIcon } from '../../icons/minus-icon';
import { PlusIcon } from '../../icons/plus-icon';
import { RotateIcon } from '../../icons/rotate-icon';
import styles from './toolbar.less';
import { ToolbarProps } from './toolbar.types';

export const Toolbar: React.FC<ToolbarProps> = ({
    className,
    currentItem,
    onRotate,
    zoom,
    zoomConfig,
    mode,
    toggleFullscreen
}) => {
    const onZoomOut = useCallback(
        () => zoomConfig?.set((prevZoom) => Math.max(prevZoom - zoomConfig.step, zoomConfig.min)),
        [zoomConfig]
    );
    const onZoomIn = useCallback(
        () => zoomConfig?.set((prevZoom) => Math.min(prevZoom + zoomConfig.step, zoomConfig.max)),
        [zoomConfig]
    );
    const onZoomSlide = useCallback((e, [val]: number[]) => zoomConfig?.set(() => val / 100), [zoomConfig]);

    return (
        <div className={cx(styles.toolbar, mode === 'fullscreen' && styles.toolbarModeFullscreen, className)}>
            {currentItem.type === 'image' && onRotate && (
                <span onClick={() => onRotate(currentItem.id)} className={cx(styles.toolbarButton)}>
                    <RotateIcon className={styles.toolbarIcon} />
                </span>
            )}
            {currentItem.type === 'image' && zoomConfig && (
                <div className={cx(styles.zoomControls)}>
                    <span onClick={onZoomOut} className={cx(styles.zoomButton, styles.zoomOutButton)}>
                        <MinusIcon className={styles.toolbarIcon} />
                    </span>
                    <RangePicker
                        value={[(zoom ?? 1) * 100]}
                        step={zoomConfig.step * 100}
                        onInput={onZoomSlide}
                        min={zoomConfig.min * 100}
                        max={zoomConfig.max * 100}
                        view="default"
                        className={styles.rangePicker}
                    />
                    <span onClick={onZoomIn} className={cx(styles.zoomButton, styles.zoomInButton)}>
                        <PlusIcon className={styles.toolbarIcon} />
                    </span>
                </div>
            )}
            {currentItem.type !== 'image' && (
                <a
                    href={currentItem.downloadUrl || currentItem.previewUrl}
                    download={true}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx(styles.toolbarButton)}
                >
                    <DownloadIcon className={styles.toolbarIcon} />
                </a>
            )}
            {toggleFullscreen && (
                <span onClick={toggleFullscreen} className={cx(styles.toolbarButton)}>
                    {mode === 'fullscreen' ? (
                        <ExitFullscreenIcon className={styles.toolbarIcon} />
                    ) : (
                        <FullscreenIcon className={styles.toolbarIcon} />
                    )}
                </span>
            )}
        </div>
    );
};
