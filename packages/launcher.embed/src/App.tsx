import { extractRelevantTranslations } from '@toloka-tb/bootstrap';
import { makePostMessageRequest } from '@toloka-tb/iframe-api/rpc';
import { Button } from '@toloka-tb/common/components/Button';
import { initTheme } from '@toloka-tb/common/tools/initTheme';
import { useObserver } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { render as reactDOMRender } from 'react-dom';

import translations from '../i18n/launcher.embed.translations';
import styles from './App.less';
import { initializeMetrika } from './initializeMetrika';
import { Store } from './store';

const endMarkerId = 'form-end-marker';

const App: React.FC<{ store: Store; submit: (output: object) => void }> = ({ store, submit }) => {
    const ctx = useObserver(() => store.ctx);
    const metrikaParams = useObserver(() => store.features.metrikaParams);
    const submitBtnText = useObserver(() => {
        const submitText = store.features.submit;

        if (typeof submitText !== 'undefined') {
            return submitText;
        }

        const messages = extractRelevantTranslations(translations, store.features.locales);

        return messages.submitDefaultText;
    });
    const handleSubmit = React.useCallback(() => {
        submit(ctx?.submit() || {});
    }, [ctx, submit]);

    useEffect(() => {
        if (metrikaParams) {
            initializeMetrika(metrikaParams);
        }
    }, [metrikaParams]);
    if (!ctx) {
        return null;
    }

    return (
        <ctx.Component ctx={ctx} onSubmit={() => store.features.submitByEnter !== false && handleSubmit()}>
            {submitBtnText && (
                <div className={styles.submitBtn}>
                    <Button size="s" onClick={handleSubmit}>
                        {submitBtnText}
                    </Button>
                </div>
            )}
            <div id={endMarkerId} />
        </ctx.Component>
    );
};

let lastHeight = 0;
let didRender = false;

export const render = (store: Store, submit: (output: object) => void) => {
    if (didRender) {
        return;
    }

    didRender = true;
    const rootNode = document.createElement('div');

    rootNode.classList.add(styles.root);
    rootNode.classList.add('text-m');

    document.body.appendChild(rootNode);

    setInterval(() => {
        const endMarker = document.getElementById(endMarkerId);
        const height = endMarker ? endMarker.offsetTop : 0;

        if (lastHeight !== height) {
            lastHeight = height;
            makePostMessageRequest(window.parent, 'reportFormHeight', height);
        }
    }, 100);

    initTheme();
    reactDOMRender(<App store={store} submit={submit} />, rootNode);
};
