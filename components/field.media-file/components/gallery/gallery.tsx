import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useCurrentItem } from '../../contexts/currentItemContext';
import { useScrollToCurrentElement } from '../../hooks/useScrollToCurrentElement';
import { isTouchDevice } from '../../utils/isTouchDevice';
import { Slider } from '../slider/slider';
import { Spin } from '../spin/spin';
import { ThumbsList } from '../thumbs-list/thumbs-list';
import styles from './gallery.less';
import { GalleryProps } from './gallery.types';

export const Gallery: React.FC<GalleryProps> = observer(
    ({ items, AttachmentView, t, toggleFullscreen, mode = 'block', loaded, hasOriginals, withZoom }) => {
        const currentItemIndex = useCurrentItem();
        const [thumbsListRef] = useScrollToCurrentElement(currentItemIndex);

        const showSlider = window.innerWidth > 768 && items.length > 0 && hasOriginals;
        const isMultiItems = items.length > 1;
        const showCounterInTitle = isMultiItems && showSlider;
        const isFullscreen = mode === 'fullscreen';
        const thumbsListMode = isFullscreen ? 'fullscreen' : showSlider ? 'gallery' : 'list';

        const title = (
            <p className={cx(styles.galleryTitle)}>
                {t('uploadedEntities')}
                {showCounterInTitle && `, ${t('nOfTotal', { number: currentItemIndex + 1, total: items.length })}`}
            </p>
        );

        return (
            <div
                className={cx(
                    styles.gallery,
                    isFullscreen ? styles.galleryModeFullscreen : styles.galleryModeBlock,
                    showSlider && styles.galleryWithSlider,
                    (!loaded || !items.length) && styles.empty,
                    isTouchDevice() && styles.hovered,
                    !items.length && styles.emptyGallery
                )}
            >
                {loaded && showSlider && (
                    <Slider
                        items={items}
                        controlClassName={styles.control}
                        toggleFullscreen={toggleFullscreen}
                        mode={mode}
                        withZoom={withZoom}
                    >
                        {title}
                    </Slider>
                )}
                {(!loaded || !showSlider) && title}
                {!loaded && <Spin />}
                {loaded && (isMultiItems || !showSlider) && (
                    <ThumbsList
                        innerRef={thumbsListRef}
                        items={items}
                        mode={thumbsListMode}
                        direction={mode === 'block' ? 'column' : 'list'}
                        AttachmentView={AttachmentView}
                    />
                )}
                {loaded && !items.length && <div className={styles.noAttachments}>{t('noAttachments')}</div>}
            </div>
        );
    }
);
