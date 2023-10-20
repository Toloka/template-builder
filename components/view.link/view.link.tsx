import { create as createOpenLink } from '@toloka-tb/action.open-link';
import { Action, Core } from '@toloka-tb/core/coreComponentApi';
import { create as createText } from '@toloka-tb/view.text';
import * as React from 'react';

import styles from './view.link.less';

const type = 'view.link';

type Props = { url: string; content: string; onOpen?: Action };

export const create = (core: Core) => {
    const { ActionHint } = core.ui;
    const { externalLinks } = core;
    const { useCtxBag } = core._lowLevel;
    const openLink = createOpenLink(core).compile;
    const text = createText(core).compile;

    return {
        type,
        compile: core.helpers.viewWithChildren(
            type,
            (props: Props) => ({ text: text({ content: props.content || props.url }) }),
            (props) => {
                const { url } = props;

                const ctxBag = useCtxBag();

                const handleClick = React.useCallback(
                    (event: React.MouseEvent) => {
                        event.preventDefault();
                        externalLinks.open(ctxBag, url);
                    },
                    [ctxBag, url]
                );

                return (
                    <div className={styles.container}>
                        <ActionHint action={openLink} payload={url} />
                        <a
                            className={styles.link}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleClick}
                        >
                            {props.children.text}
                        </a>
                    </div>
                );
            }
        )
    };
};
