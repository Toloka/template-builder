import { Child, Core } from '@toloka-tb/core/coreComponentApi';
import { create as createMediaComponents, MediaLayoutProps } from '@toloka-tb/lib.media-view';
import * as React from 'react';

import styles from './view.device-frame.less';

const type = 'view.device-frame';

type Props = { content: Child; label?: string; hint?: string } & MediaLayoutProps;

const defaultRatio = [9, 16] as [number, number];
const padding = {
    top: 30,
    bottom: 30,
    left: 10,
    right: 10
};

export const create = (core: Core) => {
    const Hint = core.ui.Hint;
    const { MediaLayout } = createMediaComponents(core);

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: Props) => ({ content: props.content }),
            ({ children, ratio, label, hint, ...layoutProps }) => (
                <MediaLayout
                    {...layoutProps}
                    ratio={ratio || defaultRatio}
                    verticalPadding={padding.top + padding.bottom}
                    horizontalPadding={padding.left + padding.right}
                >
                    <div className={styles.container}>
                        {(hint || label) && (
                            <div className={styles.label}>{hint ? <Hint label={label} hint={hint} /> : label}</div>
                        )}
                        <div className={styles.head} />
                        <div className={styles.body}>{children.content}</div>
                        <div className={styles.tail} />
                    </div>
                </MediaLayout>
            ),
            {
                showLabel: false,
                showHintInLabel: false
            }
        )
    };
};
