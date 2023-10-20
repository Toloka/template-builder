import { create as createOpenClose } from '@toloka-tb/action.open-close';
import { create as createZoomInOut } from '@toloka-tb/action.zoom-in-out';
import { OnScrollChange, ScrollPosition } from '@toloka-tb/core/api/hooks/useScrollStoring';
import { Core, CreateOptions } from '@toloka-tb/core/coreComponentApi';
import { createUseSyncFullscreen } from '@toloka-tb/lib.fullscreen';
import { create as createMediaComponents, MediaLayoutProps, useLazyLoad } from '@toloka-tb/lib.media-view';
import { Modal } from '@toloka-tb/lib.modal';
import cx from 'classnames';
import * as React from 'react';

import { createFigure } from './figure';
import translations from './i18n/view.image.translations';
import styles from './view.image.less';

const type = 'view.image';

type NonUserProps = {
    providedScroll?: ScrollPosition;
    onScrollChange?: OnScrollChange;
};

type Props = {
    url: string;
    popup?: boolean;
    scrollable?: boolean;
    rotatable?: boolean;
    noBorder?: boolean;
    noLazyLoad?: boolean;
    transparent?: boolean;
} & NonUserProps &
    MediaLayoutProps;

export const create = (core: Core, createOptions: CreateOptions) => {
    const { useComponentState, useComponentActions } = core.hooks;
    const { useScrollStoring } = core.hooks;

    const openClose = createOpenClose(core).compile;
    const zoomInOut = createZoomInOut(core).compile;

    const Figure = createFigure(core);
    const { MediaLayout } = createMediaComponents(core);

    const useSyncFullscreen = createUseSyncFullscreen(core, createOptions, openClose);

    return {
        type,
        compile: core.helpers.view<Props>(
            type,
            ({
                url,
                popup = true,
                scrollable = false,
                providedScroll,
                onScrollChange,
                noBorder = false,
                noLazyLoad = false,
                rotatable = false,
                transparent = false,
                ...restProps
            }) => {
                // basically we do this minWidth = 150 if undefined, ensure minWidth < maxWidth
                restProps.minWidth = Math.min(restProps.minWidth || 150, restProps.maxWidth || 9999);

                const initState = React.useMemo(() => ({ isOpen: false, zoomed: false, rotation: 0 }), []);
                const state = useComponentState(initState);
                const [toggleModalVisibility, toggleHorizontalScroll] = useComponentActions([openClose, zoomInOut]);
                const [handleScrollContainerRef, scrollToStoredPosition] = useScrollStoring(
                    onScrollChange,
                    providedScroll
                );

                const [mediaLayoutRef, shouldLoad] = useLazyLoad(createOptions && createOptions.env);

                // we don't want to use fullscreen in template launcher, because it's jumps
                const allowFullscreen = createOptions.env.isModalOpenInFullscreen;

                useSyncFullscreen(allowFullscreen && state.isOpen);

                const handleClick = React.useCallback(() => {
                    if (scrollable) {
                        toggleHorizontalScroll();
                    } else if (popup) {
                        toggleModalVisibility();
                    }
                }, [popup, scrollable, toggleModalVisibility, toggleHorizontalScroll]);

                React.useEffect(() => {
                    if (state.isOpen) {
                        const keypressHandler = (event: KeyboardEvent) => {
                            if (state.isOpen && event.keyCode === 27) {
                                toggleModalVisibility();
                            }
                        };

                        window.addEventListener('keydown', keypressHandler);

                        return () => window.removeEventListener('keydown', keypressHandler);
                    }
                }, [state.isOpen, popup, toggleModalVisibility]);

                const onClose = React.useCallback(() => toggleModalVisibility(false), [toggleModalVisibility]);

                return (
                    <>
                        <Modal
                            isOpen={state.isOpen}
                            onRequestClose={onClose}
                            shouldFocusAfterRender={false}
                            contentRef={handleScrollContainerRef}
                            className={styles.fullscreenWrapper}
                            overlayClassName={styles.fullscreenOverlay}
                        >
                            <Figure
                                url={url}
                                isOpen={true}
                                zoomed={state.zoomed}
                                rotation={state.rotation}
                                rotatable={rotatable}
                                shouldLoad={shouldLoad}
                                noLazyLoad={noLazyLoad || state.isOpen}
                                popup={popup}
                                scrollable={scrollable}
                                scrollToStoredPosition={scrollToStoredPosition}
                                onClick={handleClick}
                            />
                        </Modal>
                        <MediaLayout {...restProps} ref={mediaLayoutRef}>
                            <div
                                className={cx(styles.inlineWrapper, noBorder && styles.inlineWrapperNoBorder)}
                                ref={handleScrollContainerRef}
                            >
                                {state.isOpen || (
                                    <Figure
                                        url={url}
                                        isOpen={false}
                                        zoomed={state.zoomed}
                                        rotation={state.rotation}
                                        rotatable={rotatable}
                                        shouldLoad={shouldLoad}
                                        noLazyLoad={noLazyLoad}
                                        popup={popup}
                                        scrollable={scrollable}
                                        transparent={transparent}
                                        scrollToStoredPosition={scrollToStoredPosition}
                                        onClick={handleClick}
                                    />
                                )}
                            </div>
                        </MediaLayout>
                    </>
                );
            }
        )
    };
};

export { translations };
