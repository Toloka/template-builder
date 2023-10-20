import { IconInfo } from '@toloka-tb/common/icons/info';
import cx from 'classnames';
import React, { useRef, useState } from 'react';
import { PopperProps, usePopper } from 'react-popper';
import useOnClickOutside from 'use-onclickoutside';

import { Label } from '../Label/Label';
import styles from './Hint.less';

export type HintProps = {
    label?: string;
    hint: string;
    className?: string;
    position?: PopperProps<unknown>['placement'];
    requiredMark?: boolean;
};
export const Hint: React.FC<HintProps> = ({ position, label, hint, className, requiredMark }) => {
    const [hintPosition, setHintPosition] = React.useState(position || 'right');
    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
    const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
    const popperElementRef = useRef<HTMLDivElement>(null);

    const { styles: popperStyles, attributes, update } = usePopper(referenceElement, popperElementRef.current, {
        modifiers: [
            { name: 'arrow', options: { element: arrowElement } },
            { name: 'offset', options: { offset: [0, 10] } }
        ],
        placement: hintPosition
    });

    const labelRef = React.useCallback(
        (ref: HTMLDivElement | null) => {
            if (position || !ref) {
                return;
            }

            requestAnimationFrame(() => {
                const rtlMode = window.getComputedStyle(ref, null).getPropertyValue('direction');

                if (!rtlMode) {
                    return;
                }

                setHintPosition(rtlMode === 'rtl' ? 'left' : 'right');
                if (update) {
                    update();
                }
            });
        },
        [position, update]
    );
    const [overlayVisible, setOverlayVisible] = React.useState(false);

    const toggleOverlay = React.useCallback(() => setOverlayVisible((old) => !old), []);

    useOnClickOutside(popperElementRef, () => setOverlayVisible(false));

    return (
        <div aria-label={hint} ref={labelRef}>
            <div className={cx(styles.container)}>
                <Label requiredMark={requiredMark} label={label} />
                <div ref={setReferenceElement as any} onClick={toggleOverlay} className={styles.iconContainer}>
                    <IconInfo className={cx(styles.icon, overlayVisible && styles.iconActive)} />
                </div>
                {overlayVisible && (
                    <div
                        ref={popperElementRef}
                        style={popperStyles.popper}
                        className={cx(styles.content, overlayVisible && styles.active, className)}
                        {...attributes.popper}
                    >
                        {hint}
                        <div
                            ref={setArrowElement as any}
                            style={popperStyles.arrow}
                            className={styles.arrow}
                            {...attributes.arrow}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
