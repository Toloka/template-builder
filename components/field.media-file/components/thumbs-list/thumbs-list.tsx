import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useCurrentItem, useCurrentItemMethods } from '../../contexts/currentItemContext';
import styles from './thumbs-list.less';
import { ThumbsListProps } from './thumbs-list.types';

const additionalStyles = {
    container: styles.galleryThumbContainer,
    attachment: styles.galleryThumb,
    name: styles.galleryThumbName
};

const additionalStylesForImages = {
    ...additionalStyles,
    attachment: cx(additionalStyles.attachment, styles.galleryThumbTypeImage)
};

const renderSpacers = (count: number, keySuffix: string): JSX.Element[] => {
    const result: JSX.Element[] = [];

    for (let i = 0; i < count; i++) {
        result.push(<div className={styles.spacer} key={`spacer-${i}-${keySuffix}`}></div>);
    }

    return result;
};

export const ThumbsList: React.FC<ThumbsListProps> = observer(({ items, AttachmentView, innerRef, mode }) => {
    const currentItemIndex = useCurrentItem();
    const { setCurrentItemIndex } = useCurrentItemMethods();

    return (
        <div
            className={cx(
                styles.galleryThumbs,
                mode === 'gallery' && styles.modeGallery,
                mode === 'fullscreen' && styles.modeFullscreen
            )}
        >
            <div className={styles.galleryThumbsContainer} ref={innerRef}>
                {mode === 'fullscreen' && renderSpacers(items.length - currentItemIndex - 1, 'pre')}
                {items.map((item, i) => {
                    const att = (
                        <AttachmentView
                            key={item.id}
                            selected={currentItemIndex === i}
                            preview={item.previewUrl}
                            name={String(i + 1)}
                            onClick={() => setCurrentItemIndex(i)}
                            removeTitle={true}
                            additionalStyles={item.type === 'image' ? additionalStylesForImages : additionalStyles}
                        />
                    );

                    if (mode === 'list') {
                        return (
                            <a
                                key={item.id}
                                href={item.downloadUrl || item.previewUrl}
                                download={true}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.galleryThumbLink}
                            >
                                {att}
                            </a>
                        );
                    }

                    return att;
                })}
                {mode === 'fullscreen' && renderSpacers(currentItemIndex, 'pre')}
            </div>
        </div>
    );
});
