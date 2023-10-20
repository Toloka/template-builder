import { InputEditor } from '@toloka-tb/editor.input';
import { Output } from '@toloka-tb/editor.output';
import { Pane, PaneContent, PaneTitle } from '@toloka-tb/editor.pane';
import { ResizableList } from '@toloka-tb/editor.resizable-list';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';

import { key } from '../intlKeys';
import { PreviewStore } from '../Preview/preview.store';

export const Data: React.FC<{ input: PreviewStore['input']; output: PreviewStore['output'] }> = observer(
    ({ input, output }) => {
        const { formatMessage: t } = useIntl();

        return (
            <ResizableList
                direction="horizontal"
                items={[
                    {
                        id: 'label',
                        initialSize: '1',
                        minWidth: '20%',
                        content: (
                            <Pane>
                                <PaneTitle>{t(key.inputTitle)}</PaneTitle>
                                <PaneContent>
                                    <InputEditor store={input} />
                                </PaneContent>
                            </Pane>
                        )
                    },
                    {
                        id: 'output',
                        initialSize: '1',
                        minWidth: '20%',
                        content: (
                            <Pane>
                                <PaneTitle>{t(key.outputTitle)}</PaneTitle>
                                <PaneContent>{output.value && <Output store={output} />}</PaneContent>
                            </Pane>
                        )
                    }
                ]}
            />
        );
    }
);
