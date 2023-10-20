import { create as createOpenClose } from '@toloka-tb/action.open-close';
import { create as createRotate } from '@toloka-tb/action.rotate/action.rotate';
import { IconFullscreen } from '@toloka-tb/common/icons/fullscreen';
import { IconRotateLeft } from '@toloka-tb/common/icons/rotateLeft';
import { IconRotateRight } from '@toloka-tb/common/icons/rotateRight';
import { Core } from '@toloka-tb/core/coreComponentApi';
import { create as createMediaComponents } from '@toloka-tb/lib.media-view';
import cx from 'classnames';
import * as React from 'react';

import { getRotationTransform } from './getRotationTransform';
import translations from './i18n/view.image.translations';
import { useImageLoading } from './useImageLoading';
import styles from './view.image.less';

export type FigureProps = {
    url: string;
    isOpen: boolean;
    popup: boolean;
    rotation: number;
    rotatable: boolean;
    shouldLoad: boolean;
    noLazyLoad: boolean;
    zoomed: boolean;
    scrollable: boolean;
    transparent?: boolean;
    scrollToStoredPosition: () => void;
    onClick: () => void;
};

export const createFigure = (core: Core) => {
    const { ActionHint } = core.ui;
    const { useComponentActions } = core.hooks;

    const openClose = createOpenClose(core).compile;
    const rotateAction = createRotate(core).compile;

    const { MediaError } = createMediaComponents(core);

    const Figure: React.FC<FigureProps> = ({
        url,
        isOpen,
        zoomed,
        rotation,
        rotatable,
        noLazyLoad,
        shouldLoad,
        popup,
        scrollable,
        transparent,
        scrollToStoredPosition,
        onClick
    }) => {
        const t = core.i18n.useTranslation<keyof typeof translations.ru>('view.image');

        const [rotate] = useComponentActions([rotateAction]);
        const [error, handleError, loading, onLoad, hideForReflow] = useImageLoading(url, t('errorLoadFailed'));

        const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
        const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });
        const containerRef = core.hooks.useResizeObserver((rect) => {
            return setContainerSize({ width: rect.width, height: rect.height });
        }, []);
        const imageRef = React.useRef<HTMLImageElement>(null);

        const handleLoad = React.useCallback(() => {
            onLoad();
            scrollToStoredPosition();

            if (!imageRef.current) {
                return;
            }
            setImageSize({ height: imageRef.current.height, width: imageRef.current.width });
        }, [onLoad, scrollToStoredPosition]);

        const imageStyle = React.useMemo(() => getRotationTransform(rotation, imageSize, containerSize), [
            rotation,
            imageSize,
            containerSize
        ]);

        const handleClick = React.useCallback(() => {
            if (loading || error) {
                return;
            }

            onClick();
        }, [error, loading, onClick]);

        return (
            <figure
                className={cx(
                    styles.figure,
                    !isOpen && styles.figureInline,
                    error && styles.figureWithError,
                    loading && styles.figureLoading,
                    scrollable && styles.figureScrollable,
                    zoomed && styles.figureScrollableX,
                    transparent && styles.figureTransparent
                )}
                ref={containerRef}
                onClick={handleClick}
            >
                <div className={styles.actions}>
                    {popup && !isOpen && !scrollable && (
                        <div className={styles.action}>
                            <ActionHint action={openClose} className={styles.sequence} dispatch={false} />
                            <IconFullscreen />
                        </div>
                    )}
                    {rotatable && (
                        <>
                            <button
                                type="button"
                                className={styles.action}
                                onClick={(event) => {
                                    rotate('left');
                                    event.stopPropagation();
                                }}
                            >
                                <ActionHint
                                    action={rotateAction}
                                    payload="left"
                                    className={styles.sequence}
                                    dispatch={false}
                                />
                                <IconRotateLeft />
                            </button>
                            <button
                                type="button"
                                className={styles.action}
                                onClick={(event) => {
                                    rotate('right');
                                    event.stopPropagation();
                                }}
                            >
                                <ActionHint
                                    action={rotateAction}
                                    payload="right"
                                    className={styles.sequence}
                                    dispatch={false}
                                />
                                <IconRotateRight />
                            </button>
                        </>
                    )}
                </div>
                {(shouldLoad || noLazyLoad) && !hideForReflow && !error && (
                    <img
                        className={cx(
                            styles.image,
                            isOpen ? styles.imageFullscreen : styles.imageInline,
                            scrollable && styles.imageScrollable,
                            zoomed && styles.imageScrollableX
                        )}
                        style={imageStyle}
                        src={url}
                        ref={imageRef}
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                )}
                <MediaError error={error} url={url} />
            </figure>
        );
    };

    return Figure;
};
