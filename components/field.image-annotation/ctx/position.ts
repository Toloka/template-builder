import { Core } from '@toloka-tb/core/coreComponentApi';
import { action, observable, reaction } from 'mobx';
import { useEffect, useMemo } from 'react';

import { AnnotationContext } from './ctx';
import styles from './position.less';

export type PositionContext = {
    canvas: {
        width: number;
        height: number;
        getSVG: () => SVGSVGElement;
    };
    image: {
        width: number;
        height: number;
        url: string;
        isLoading: boolean;
        loadingError?: string;
    };
    cursor: {
        x: number;
        y: number;
    };
    pan: {
        left: number;
        top: number;
    };
    zoom: number;
};

// position utils
export const resetImagePosition = action((ctx: PositionContext) => {
    if (ctx.canvas.width <= 0 || ctx.image.width <= 0) {
        return;
    }
    const heightRatio = ctx.canvas.height / ctx.image.height;
    const widthRatio = ctx.canvas.width / ctx.image.width;

    ctx.zoom = Math.min(heightRatio, widthRatio);
    ctx.pan.left = 0;
    ctx.pan.top = 0;
});

export const clamp = (min: number, value: number, max: number) => {
    if (value < min) return min;
    if (value > max) return max;

    return value;
};

export const left2x = (ctx: PositionContext, left: number) => (ctx.image.width * left + ctx.pan.left) * ctx.zoom;
export const top2y = (ctx: PositionContext, top: number) => (ctx.image.height * top + ctx.pan.top) * ctx.zoom;

export const x2left = (ctx: PositionContext, x: number) => (x / ctx.zoom - ctx.pan.left) / ctx.image.width;
export const y2top = (ctx: PositionContext, y: number) => (y / ctx.zoom - ctx.pan.top) / ctx.image.height;

export const getCursorPosInImgSpace = (ctx: PositionContext, clientX: number, clientY: number) => {
    const rect = ctx.canvas.getSVG().getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return {
        left: clamp(0, x2left(ctx, x), 1),
        top: clamp(0, y2top(ctx, y), 1)
    };
};

export const zoomAt = action((ctx: PositionContext, left: number, top: number, by: number) => {
    const prevZoom = ctx.zoom;
    const nextZoom = clamp(0.01, ctx.zoom * (1 + by), 100);
    const realBy = nextZoom - prevZoom;

    // adjust pan so zoomed dot does not move
    const shiftX = (ctx.pan.left * realBy + ctx.image.width * left * realBy) / nextZoom;
    const shiftY = (ctx.pan.top * realBy + ctx.image.height * top * realBy) / nextZoom;

    ctx.pan.left -= shiftX;
    ctx.pan.top -= shiftY;

    ctx.zoom = nextZoom;
});

const useImageAutoSize = (ctx: PositionContext, t: AnnotationContext['t']) => {
    useEffect(() => {
        const img = document.createElement('img');

        img.classList.add(styles.reference);

        img.src = ctx.image.url;
        img.onload = action(() => {
            ctx.image.height = img.naturalHeight;
            ctx.image.width = img.naturalWidth;
            ctx.image.isLoading = false;
            img.remove();
        });
        img.onerror = action(() => {
            ctx.image.isLoading = false;
            ctx.image.height = -1;
            ctx.image.width = -1;
            ctx.image.loadingError = t('imageLoadingError');
            img.remove();
        });

        document.body.appendChild(img);
    }, [ctx, ctx.image.url, t]);
};

const useCursorMovement = (ctx: PositionContext) => {
    useEffect(() => {
        const svg = ctx.canvas.getSVG();

        const onMouseMove = (event: MouseEvent) => {
            const { left, top } = getCursorPosInImgSpace(ctx, event.pageX, event.pageY);
            const x = left2x(ctx, left);
            const y = top2y(ctx, top);

            ctx.cursor.x = x;
            ctx.cursor.y = y;
        };

        svg.addEventListener('mousemove', onMouseMove);

        return () => {
            svg.removeEventListener('mousemove', onMouseMove);
        };
    }, [ctx]);
};

// creation
const useCanvasAutoSize = (core: Core, ctx: PositionContext) => {
    return core.hooks.useResizeObserver<HTMLDivElement>(
        (canvas) => {
            ctx.canvas.height = canvas.height;
            ctx.canvas.width = canvas.width;
        },
        [ctx]
    );
};

const makePositionCtx = (svgRef: React.RefObject<SVGSVGElement>, url: string): PositionContext => {
    const ctx = observable({
        canvas: {
            width: 0,
            height: 0,
            getSVG: () => svgRef.current!
        },
        image: {
            width: 0,
            height: 0,
            url,
            isLoading: true,
            loadingError: undefined
        },
        cursor: {
            x: 0,
            y: 0
        },
        pan: {
            left: 0,
            top: 0
        },
        zoom: 1
    });

    const dispose = reaction(
        () => [ctx.canvas.width, ctx.image.width],
        () => {
            if (ctx.canvas.width > 0 && ctx.image.width > 0) {
                resetImagePosition(ctx);
                dispose();
            }
        }
    );

    return ctx;
};

export const usePositionCtx = (
    core: Core,
    svgRef: React.RefObject<SVGSVGElement>,
    url: string,
    t: AnnotationContext['t']
) => {
    const ctx = useMemo(() => makePositionCtx(svgRef, url), [svgRef, url]);

    useImageAutoSize(ctx, t);
    useCursorMovement(ctx);
    const resizeObserverRef = useCanvasAutoSize(core, ctx);

    return {
        ctx,
        resizeObserverRef
    };
};
