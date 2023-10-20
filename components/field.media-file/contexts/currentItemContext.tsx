import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { CreateOptions } from '@toloka-tb/core/coreComponentApi';
import { CtxBag } from '@toloka-tb/core/ctx/ctxBag';
import { setListeners } from '@toloka-tb/plugin.hotkeys';
import React, { CSSProperties, useEffect, useMemo, useRef } from 'react';

import { useCurrentListItem } from '../hooks/useCurrentListItem';

const noop = () => '';

interface MethodsContext {
    id: string;
    setCurrentItemIndex: (index: number) => void;
    prev: () => void;
    next: () => void;
}

const currentItemIndexContext = React.createContext<number>(0);
const currentItemMethodsContext = React.createContext<MethodsContext>({
    id: '',
    setCurrentItemIndex: noop,
    prev: noop,
    next: noop
});

export const useCurrentItem = () => React.useContext(currentItemIndexContext);
export const useCurrentItemMethods = () => React.useContext(currentItemMethodsContext);

export interface CurrentItemContextProps {
    length: number;
    options: CreateOptions;
    ctxBag: CtxBag;
}

const hideFocusStyles: CSSProperties = {
    outline: 'none'
};

const isCurrentGallery = (el: HTMLElement | null, currentGalleryId: string): boolean => {
    if (!el) {
        return false;
    }

    const currentEl: HTMLElement | null =
        el.tagName === 'BODY' ? el.querySelector('.ReactModalPortal [data-gallery-id]') : el;

    if (!currentEl) {
        return false;
    }

    const elWithGalleryId = currentEl.dataset?.galleryId
        ? currentEl
        : (currentEl.closest('[data-gallery-id]') as HTMLElement);
    const id = elWithGalleryId ? elWithGalleryId.dataset.galleryId : '';

    return String(id) === currentGalleryId;
};

export const CurrentItemContext: React.FC<CurrentItemContextProps> = ({ children, length, options, ctxBag }) => {
    const id = useMemo(() => uniqueId(), []);
    const [currentItemIndex, setCurrentItemIndex, prev, next] = useCurrentListItem(length);
    const methods = useMemo(() => ({ setCurrentItemIndex, prev, next, id }), [next, prev, setCurrentItemIndex, id]);
    const focusRef = useRef<HTMLDivElement>(null);

    useEffect(
        () =>
            setListeners(options, ctxBag, {
                left: () => isCurrentGallery(document.activeElement as HTMLElement, id) && prev(),
                right: () => isCurrentGallery(document.activeElement as HTMLElement, id) && next()
            }),
        [ctxBag, id, next, options, prev]
    );

    return (
        <div ref={focusRef} tabIndex={0} style={hideFocusStyles} data-gallery-id={id}>
            <currentItemIndexContext.Provider value={currentItemIndex}>
                <currentItemMethodsContext.Provider value={methods}>{children}</currentItemMethodsContext.Provider>
            </currentItemIndexContext.Provider>
        </div>
    );
};
