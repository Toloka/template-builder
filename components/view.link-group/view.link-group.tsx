import { create as createOpenLink } from '@toloka-tb/action.open-link';
import { Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';

import styles from './view.link-group.less';

const type = 'view.link-group';

type LinkConfig = {
    url: string;
    content: string;
    theme?: 'primary';
};
type Props = { links: LinkConfig[] };
export const create = (core: Core) => {
    const openLink = createOpenLink(core).compile;

    return {
        type,
        compile: core.helpers.view<Props>(type, (props) => {
            const [open] = core.hooks.useComponentActions([openLink]);

            return (
                <div className={styles.container}>
                    {props.links.map((link, idx) => {
                        return (
                            <a
                                className={`${styles.link} ${link.theme === 'primary' ? styles.linkPrimary : ''}`}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    open(link.url);
                                }}
                                key={idx}
                            >
                                <core.ui.ActionHint
                                    action={openLink}
                                    payload={link.url}
                                    className={styles.actionHint}
                                    dispatch={false}
                                />
                                <span className={styles.linkContent}>{link.content}</span>
                            </a>
                        );
                    })}
                </div>
            );
        })
    };
};
