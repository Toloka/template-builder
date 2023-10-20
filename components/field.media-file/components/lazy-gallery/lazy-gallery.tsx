import React, { useEffect, useState } from 'react';

import { CurrentItemContext } from '../../contexts/currentItemContext';
import { RotateContext } from '../../contexts/rotateContext';
import { GalleryWithFullscreenProps } from '../galleryWithFullscreen/galleryWithFullscreen.types';
import { Spin } from '../spin/spin';
import styles from './lazy-gallery.less';
import { LazyGalleryProps } from './lazy-gallery.types';

let GalleryWithFullscreen: React.FC<GalleryWithFullscreenProps>;
let loadingPromise: Promise<void> | null;

export const LazyGallery = (props: LazyGalleryProps) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!loadingPromise) {
            loadingPromise = import(`../galleryWithFullscreen/galleryWithFullscreen`).then((component) => {
                GalleryWithFullscreen = component.GalleryWithFullscreen;
            });
        }

        loadingPromise.then(() => setLoaded(true));
    }, []);

    return loaded ? (
        <CurrentItemContext length={props.items.length} options={props.options} ctxBag={props.ctxBag}>
            <RotateContext>
                <GalleryWithFullscreen
                    items={props.items}
                    AttachmentView={props.AttachmentView}
                    t={props.t}
                    isFullscreenOpened={props.isFullscreenOpened}
                    toggleFullscreen={props.toggleFullscreen}
                />
            </RotateContext>
        </CurrentItemContext>
    ) : (
        <div className={styles.lazyGallery}>
            <Spin />
        </div>
    );
};
