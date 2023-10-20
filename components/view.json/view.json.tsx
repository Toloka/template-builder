// do anybody really need this view at all? I implemented it for example purposes only back in July
import { Core } from '@toloka-tb/core/coreComponentApi';
import * as React from 'react';
import JsonView from 'react-json-view';

const type = 'view.json';

type Props = { content: object; label: string };

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.view<Props>(type, ({ content, label }) => <JsonView src={content} name={label} />, {
            showLabel: false
        })
    };
};
