import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import { Button } from '@toloka-tb/common/components/Button';
import * as React from 'react';

import translations from './i18n/layout.side-by-side.translations';
import styles from './layout.side-by-side.less';

type LayoutSideBySideProps = {
    items: Child[];
    controls: Child;
    minItemWidth: number;
};

const type = 'layout.side-by-side';

const getButtonPin = (index: number, amount: number): 'round-brick' | 'clear-brick' | 'clear-round' | undefined => {
    if (amount === 1) {
        return undefined;
    }
    if (index === 0) {
        return 'round-brick';
    }
    if (index === amount - 1) {
        return 'clear-round';
    }

    return 'clear-brick';
};

const alphabetLength = 26;
const getItemLabel = (index: number) => {
    const prefix = String.fromCharCode('A'.charCodeAt(0) + (index % alphabetLength));

    if (index >= alphabetLength) {
        return `${prefix}${Math.floor(index / alphabetLength)}`;
    }

    return prefix;
};

type SBSProps = {
    items: React.ReactNode[];
    controls: React.ReactNode;
    minItemWidth: number;
};

const createSBS = (core: Core) => {
    const { useResizeObserver } = core.hooks;

    const SideBySide: React.FC<SBSProps> = ({ items, controls, minItemWidth }) => {
        const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);

        const initState = React.useMemo<{ visibleItems: boolean[]; lastToggledVisibleItem: number }>(
            () => ({ visibleItems: items.map(() => true), lastToggledVisibleItem: 0 }),
            [items]
        );
        const [containerSize, setContainerSize] = React.useState({ width: Infinity, height: Infinity });
        const resizeObserverRef = useResizeObserver<HTMLDivElement>(setContainerSize, []);
        const itemStyle = React.useMemo(() => ({ minWidth: Math.min(minItemWidth || 400, containerSize.width) }), [
            minItemWidth,
            containerSize.width
        ]);
        const desktopMode = React.useMemo(() => containerSize.height < containerSize.width, [
            containerSize.height,
            containerSize.width
        ]);
        const controlsStyle: React.CSSProperties = React.useMemo(
            () => (desktopMode ? { flexDirection: 'row', alignItems: 'flex-start' } : { flexDirection: 'column' }),
            [desktopMode]
        );
        const itemSelectorStyle = React.useMemo(
            () =>
                desktopMode
                    ? {
                          flexDirection: 'column' as 'column',
                          paddingRight: 10
                      }
                    : {
                          flexDirection: 'row-reverse' as 'row-reverse',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingBottom: 10
                      },
            [desktopMode]
        );

        const state = core.hooks.useComponentState(initState);
        const onVisibleChange = React.useCallback(
            (itemIndex) => {
                state.visibleItems[itemIndex] = !state.visibleItems[itemIndex];
                if (state.visibleItems.filter(Boolean).length === 0) {
                    state.visibleItems[itemIndex] = true;
                }
                if (state.visibleItems[itemIndex]) {
                    state.lastToggledVisibleItem = itemIndex;
                }
            },
            [state]
        );

        return (
            <div className={styles.container} ref={resizeObserverRef}>
                <div className={styles.items}>
                    {items
                        .map((item, index) => ({ item, label: getItemLabel(index) }))
                        .filter((_, index) => state.visibleItems[index])
                        .map(({ item, label }) => (
                            <div className={styles.item} style={itemStyle} key={label}>
                                <div className={styles.itemLabel}>{label}</div>
                                <div className={styles.itemContent}>{item}</div>
                            </div>
                        ))}
                </div>
                <div className={styles.controls} style={controlsStyle}>
                    <div className={styles.itemSelector} style={itemSelectorStyle}>
                        <div className={styles.itemSelectorLabel}>{t('options')}</div>
                        <div className={styles.itemSelectorButtons}>
                            {items.map((_, index) => (
                                <Button
                                    key={index}
                                    size="s"
                                    pin={getButtonPin(index, items.length)}
                                    checked={state.visibleItems[index]}
                                    onClick={() => onVisibleChange(index)}
                                >
                                    {getItemLabel(index)}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.userControls}>{controls}</div>
                </div>
            </div>
        );
    };

    return SideBySide;
};

export const create = (core: Core) => {
    const SBS = createSBS(core);

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: LayoutSideBySideProps) =>
                Object.assign(core.childrenFromArray(props.items), { controls: props.controls }),
            ({ items, children, ...restProps }) => (
                <SBS
                    {...restProps}
                    items={items.map((_, index) => children[index]).filter(Boolean)} // do not allocate space / show controls if a child is hidden by a helper:if
                    controls={children.controls}
                />
            )
        )
    };
};

export { translations };
