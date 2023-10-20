import { cnTheme } from '@yandex/ui/Theme';
import { theme } from '@yandex/ui/Theme/presets/default';
import cx from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { useCurrentItem, useCurrentItemMethods } from '../../contexts/currentItemContext';
import { useRotateMethods, useRotateState } from '../../contexts/rotateContext';
import { useRotateStyles } from '../../hooks/useRotateStyles';
import { TypedUploadItem } from '../../hooks/useTypedItems';
import { ArrowIcon } from '../../icons/arrow-icon';
import { UnknownDocumentIcon } from '../../icons/unknown-document-icon';
import { UnknownDocumentIconDark } from '../../icons/unknown-document-icon.dark';
import { Toolbar } from '../toolbar/toolbar';
import styles from './slider.less';
import { SliderProps } from './slider.types';

const noop = () => '';
const disable = { disabled: true };

const MIN_ZOOM = 1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.05;
const wheelConfig = {
    step: ZOOM_STEP
};

export const Slider: React.FC<SliderProps> = ({
    items,
    children,
    controlClassName,
    toggleFullscreen,
    mode,
    withZoom
}) => {
    const { onRotate } = useRotateMethods();
    const rotateState = useRotateState();
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [containerRef, rotateStyles] = useRotateStyles(rotateState);
    const currentItemIndex = useCurrentItem();
    const { setCurrentItemIndex, prev, next } = useCurrentItemMethods();
    const currentItem = items[currentItemIndex] as TypedUploadItem | undefined;
    const isMultiItems = items.length > 1;
    const showPrevButton = isMultiItems && currentItemIndex > 0;
    const showNextButton = isMultiItems && currentItemIndex < items.length - 1;
    const zoomRef = useRef<ReactZoomPanPinchRef>(null);
    const zoomHandler = useCallback((ref) => setZoom(ref.state.scale), []);
    const [isPanning, setPanning] = useState(false);
    const rotateStyle = currentItem?.id ? rotateStyles[currentItem.id] : {};
    const zoomConfig = useMemo(
        () => ({
            set: (handler: (oldVal: number) => number) =>
                setZoom((oldVal) => {
                    const newVal = handler(oldVal);

                    if (zoomRef.current) {
                        const step = Math.log(newVal / oldVal);

                        if (newVal > oldVal) {
                            zoomRef.current.zoomIn(step, 0);
                        } else {
                            zoomRef.current.zoomOut(-step, 0);
                        }
                    }

                    return newVal;
                }),
            max: MAX_ZOOM,
            min: MIN_ZOOM,
            step: ZOOM_STEP
        }),
        []
    );

    useUpdateEffect(() => setCurrentItemIndex(0), [items]);
    useEffect(() => {
        setZoom(MIN_ZOOM);
        requestAnimationFrame(() => {
            if (zoomRef.current) {
                zoomRef.current.centerView(MIN_ZOOM, 0);
            }
        });
    }, [currentItemIndex]);
    useEffect(() => {
        requestAnimationFrame(() => {
            if (zoomRef.current) {
                zoomRef.current.centerView(undefined, 0);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rotateStyle]);

    const renderItem = (item: TypedUploadItem, i: number) => {
        const isActive = i === currentItemIndex;

        if (item.type !== 'image') {
            return (
                <div key={item.id} className={cx(styles.currentItem, !isActive && styles.hiddenItem)}>
                    <div className={cx(styles.unknownDoc)}>
                        {mode === 'fullscreen' ? <UnknownDocumentIconDark /> : <UnknownDocumentIcon />}
                        <p className={cx(styles.unknownDocLabel)}>{item.filename || item.previewLabel}</p>
                    </div>
                </div>
            );
        }

        if (withZoom) {
            return (
                <TransformWrapper
                    key={item.id}
                    minScale={MIN_ZOOM}
                    maxScale={MAX_ZOOM}
                    onZoom={zoomHandler}
                    onPanningStart={() => setPanning(true)}
                    onPanningStop={() => setPanning(false)}
                    doubleClick={disable}
                    ref={isActive ? zoomRef : null}
                    wheel={wheelConfig}
                    centerOnInit={true}
                    centerZoomedOut={true}
                    disabled={!isActive}
                >
                    <TransformComponent
                        wrapperClass={cx(styles.zoomWrapper, !isActive && styles.hiddenItem)}
                        contentClass={cx(styles.zoomContent, isPanning && styles.panning)}
                    >
                        <img
                            src={item.downloadUrl || item.previewUrl}
                            className={styles.currentImage}
                            style={rotateStyle}
                            onClick={mode !== 'fullscreen' ? toggleFullscreen : noop}
                            onLoad={() => zoomRef.current?.centerView(MIN_ZOOM, 0)}
                        />
                    </TransformComponent>
                </TransformWrapper>
            );
        }

        return (
            <img
                key={item.id}
                src={item.downloadUrl || item.previewUrl}
                className={cx(styles.currentImage, !isActive && styles.hiddenItem)}
                style={rotateStyle}
                onClick={mode !== 'fullscreen' ? toggleFullscreen : noop}
            />
        );
    };

    return (
        <div
            className={cx(
                styles.slider,
                mode === 'fullscreen' ? styles.sliderModeFullscreen : styles.sliderModeBlock,
                cnTheme(theme)
            )}
            ref={containerRef}
        >
            {children}
            <button
                onClick={prev}
                className={cx(
                    styles.controlButton,
                    styles.prevButton,
                    controlClassName,
                    !showPrevButton && styles.hidden
                )}
                tabIndex={-1}
            >
                <ArrowIcon className={styles.arrowIcon} />
            </button>
            {items.map(renderItem)}
            {currentItem?.type && (
                <Toolbar
                    currentItem={currentItem}
                    className={controlClassName}
                    onRotate={onRotate}
                    zoom={zoom}
                    zoomConfig={withZoom ? zoomConfig : undefined}
                    mode={mode}
                    toggleFullscreen={toggleFullscreen}
                />
            )}
            <button
                onClick={next}
                className={cx(
                    styles.controlButton,
                    styles.nextButton,
                    controlClassName,
                    !showNextButton && styles.hidden
                )}
                tabIndex={-1}
            >
                <ArrowIcon className={styles.arrowIcon} />
            </button>
        </div>
    );
};
