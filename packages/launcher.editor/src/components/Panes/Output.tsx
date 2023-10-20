import { Output } from '@toloka-tb/editor.output';
import { PaneContent, PaneFooter } from '@toloka-tb/editor.pane';
import { Button } from '@toloka-tb/common/components/Button';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { controller } from '../../sideEffect/controller';
import { outputStore } from '../../store/previewStore';
import styles from './Output.less';

export const OutputPane = () => {
    const hide = React.useCallback(() => {
        controller.setPaneOpen('output', false);
    }, []);
    const [t] = useTranslation();

    return (
        <>
            <PaneContent>
                <Output store={outputStore} />
            </PaneContent>
            <PaneFooter className={styles.footer}>
                <Button size="s" view="pseudo" onClick={hide}>
                    {t('output.close')}
                </Button>
            </PaneFooter>
        </>
    );
};
