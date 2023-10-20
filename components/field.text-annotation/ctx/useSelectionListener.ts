import { action } from '@toloka-tb/core/node_modules/mobx';
import { useObserver } from '@toloka-tb/core/node_modules/mobx-react-lite';
import * as React from 'react';

import { getBrowserSelection } from '../utils/getBrowserSelection';
import { AnnotationContext } from './ctx';

const getMobileOS = () => {
    const ua = navigator.userAgent;

    if (/android/i.test(ua)) {
        return 'Android';
    } else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return 'iOS';
    }

    return 'Other';
};

export const useSelectionListener = (ctx: AnnotationContext, textContainerRef: React.RefObject<HTMLDivElement>) => {
    const activeLabel = useObserver(() => ctx.activeLabel);

    React.useEffect(() => {
        const isMobile = getMobileOS() !== 'Other';
        const [start, end] = isMobile ? ['touchstart', 'touchend'] : ['mouseup', 'mouseleave'];

        const selectionChangeListener = action(() => {
            if (!textContainerRef.current) return;

            ctx.selection = getBrowserSelection(textContainerRef.current);

            if (ctx.selection && ctx.activeLabel) {
                ctx.actions.annotate(ctx, ctx.activeLabel);
                ctx.selection = null;
            }
        });

        document.addEventListener(start, selectionChangeListener);
        document.addEventListener(end, selectionChangeListener);
        document.addEventListener('keyup', selectionChangeListener);

        return () => {
            document.removeEventListener(start, selectionChangeListener);
            document.removeEventListener(end, selectionChangeListener);
            document.removeEventListener('keyup', selectionChangeListener);
        };
    }, [ctx, activeLabel, textContainerRef]);
};
