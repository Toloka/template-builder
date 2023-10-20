import { Modal } from '@toloka-tb/lib.modal';
import cx from 'classnames';
import React, { useMemo } from 'react';

import { useCurrentItemMethods } from '../../contexts/currentItemContext';
import { Gallery } from '../gallery/gallery';
import styles from './fullscreen.less';
import { FullscreenProps } from './fullscreen.types';

export const Fullscreen: React.FC<FullscreenProps> = ({ isOpen, onClose, t, AttachmentView, items }) => {
    const { id } = useCurrentItemMethods();
    const data = useMemo(() => ({ 'gallery-id': id }), [id]);

    return (
        <Modal
            isOpen={isOpen}
            className={cx(styles.fullscreenWrapper, styles.noFocus)}
            overlayClassName={styles.fullscreenOverlay}
            onRequestClose={onClose}
            shouldFocusAfterRender={true}
            data={data}
        >
            <Gallery
                t={t}
                AttachmentView={AttachmentView}
                items={items}
                mode="fullscreen"
                toggleFullscreen={onClose}
                // If we render fullscreen then images already loaded and one of they has original
                loaded={true}
                hasOriginals={true}
                withZoom={true}
            />
        </Modal>
    );
};
