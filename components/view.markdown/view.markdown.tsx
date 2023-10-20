import { Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './view.markdown.less';

const type = 'view.markdown';

type Props = { content: string };

const render: { [nodeType: string]: React.ElementType<any> } = {
    // eslint-disable-next-line react/display-name
    link: (props) => (
        <a href={props.href} target="_blank" rel="noopener noreferrer">
            {props.children}
        </a>
    )
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.view<Props>(type, ({ content }) => (
            <div className={styles.container}>
                <ReactMarkdown source={String(content)} renderers={render} />
            </div>
        ))
    };
};
