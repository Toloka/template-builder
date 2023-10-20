import { Pane, PaneContent, PaneFooter, PaneTitle } from '@toloka-tb/editor.pane';
import { Preview as PreviewCore } from '@toloka-tb/editor.preview';
import cx from 'classnames';
import { Button } from '@toloka-tb/common/components/Button';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';

import { key } from '../intlKeys';
import styles from './Preview.less';
import { PreviewStore, resetPreviewCtx, submitPreview } from './preview.store';

export const Preview: React.FC<{ store: PreviewStore }> = observer(({ store }) => {
    const { formatMessage: t } = useIntl();

    const errors =
        store.input.parse.state === 'error'
            ? store.input.parse.errors.map((err) => ({
                  ...err,
                  message: t(key[err.message as keyof typeof key])
              }))
            : [];

    const submit = () => submitPreview(store);
    const reset = () => resetPreviewCtx(store);

    return (
        <Pane className={styles.preview}>
            <PaneTitle loading={store.ctxUpdateTimeout !== undefined}>{t(key.previewTitle)}</PaneTitle>
            <PaneContent>
                <PreviewCore ctx={store.ctx} env={store.env} errors={errors} onSubmit={submit} />
            </PaneContent>
            <PaneFooter className={styles.previewFooter}>
                <Button size="s" view="clear" onClick={reset} className={styles.previewFooterAction}>
                    {t(key['preview.reset'])}
                </Button>
                <Button
                    type="submit"
                    size="s"
                    view="pseudo"
                    onClick={submit}
                    className={cx(styles.previewFooterAction, styles.previewFooterSubmit)}
                >
                    {t(key['preview.submit'])}
                </Button>
            </PaneFooter>
        </Pane>
    );
});
