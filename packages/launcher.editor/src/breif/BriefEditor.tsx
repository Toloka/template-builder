import { observer } from 'mobx-react-lite';
import React from 'react';

import { BreifStore } from './briefStore';

export const BriefEditor = observer(({ store }: { store: BreifStore }) => {
    return (
        <div style={{ padding: 20, overflowY: 'scroll' }}>
            <store.editorCtx.Component ctx={store.editorCtx} />
        </div>
    );
});
