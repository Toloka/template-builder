import { Core } from '@toloka-tb/core/coreComponentApi';
import { RTLProps } from '@toloka-tb/schemas/rtl';
import * as React from 'react';

import styles from './view.text.less';

const type = 'view.text';

type Primitive = string | number | boolean | undefined | null;

type ViewTextProps = {
    content: Primitive;
} & RTLProps;

const Text: React.FC<ViewTextProps> = ({ content, rtl }) => (
    <div className={styles.container} dir={rtl?.mode}>
        {typeof content === 'string' ? content : JSON.stringify(content)}
    </div>
);

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.view<ViewTextProps>(type, Text)
    };
};
