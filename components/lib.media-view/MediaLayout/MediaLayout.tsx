import cx from 'classnames';
import * as React from 'react';

import styles from './MediaLayout.less';

export type MediaLayoutProps = {
    ratio?: [number, number];
    maxWidth?: number;
    minWidth?: number;
    fullHeight?: boolean;
    children: React.ReactNode;
    verticalPadding?: number;
    horizontalPadding?: number;
};

const defaultRatio = [16, 9] as [number, number];

const MediaLayoutContext = React.createContext(false);

export const MediaLayout = React.forwardRef<HTMLDivElement, MediaLayoutProps>((props, ref) => {
    const isChildOfMediaLayout = React.useContext(MediaLayoutContext);
    const containerStyles = React.useMemo(
        () => ({
            maxWidth: props.maxWidth,
            minWidth: props.minWidth,
            padding:
                props.verticalPadding || props.horizontalPadding
                    ? `${(props.verticalPadding || 0) / 2}px ${(props.horizontalPadding || 0) / 2}px`
                    : undefined
        }),
        [props.horizontalPadding, props.maxWidth, props.minWidth, props.verticalPadding]
    );
    const providedRatio = props.ratio;
    const ratioControllerStyle = React.useMemo((): React.CSSProperties => {
        let ratio = providedRatio;

        if (
            !Array.isArray(ratio) ||
            ratio.length !== 2 ||
            typeof ratio[0] !== 'number' ||
            typeof ratio[1] !== 'number'
        ) {
            ratio = defaultRatio;
        }
        const paddingTop = `${(ratio[1] / ratio[0]) * 100}%`;

        let width = `100%`;

        if (props.horizontalPadding) {
            width = `calc(${width} + ${props.horizontalPadding}px)`;
        }

        return {
            paddingTop,
            width
        };
    }, [props.horizontalPadding, providedRatio]);

    return (
        <MediaLayoutContext.Provider value={true}>
            <div
                className={cx(styles.container, props.fullHeight && styles.fullHeight)}
                style={containerStyles}
                ref={ref}
            >
                <div
                    className={cx(
                        styles.ratioController,
                        props.fullHeight && styles.fullHeight,
                        !isChildOfMediaLayout && props.fullHeight && styles.minHeight
                    )}
                    style={ratioControllerStyle}
                />
                <div className={styles.content}>{props.children}</div>
            </div>
        </MediaLayoutContext.Provider>
    );
});

MediaLayout.displayName = 'MediaLayout';
