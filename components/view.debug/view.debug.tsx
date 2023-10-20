import { Alert } from '@toloka-tb/common/UI/Alert/Alert';
import { Core } from '@toloka-tb/core/coreComponentApi';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import JsonView from 'react-json-view';

const type = 'view.debug';

type Props = { insane: boolean };

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.view<Props>(
            type,
            observer(({ insane }) => {
                const bag = core._lowLevel.useCtxBag();

                if (insane) {
                    // eslint-disable-next-line no-console
                    console.log('BAG', toJS(bag, { recurseEverything: true }));
                }

                return (
                    <Alert theme="info">
                        {insane && 'See console'}
                        <JsonView
                            src={toJS(bag.tb.output.value, { recurseEverything: true })}
                            name={'[DEBUG output]'}
                        />
                        <JsonView
                            src={toJS(bag.tb.internal.value, { recurseEverything: true })}
                            name={'[DEBUG internal]'}
                        />
                        <JsonView
                            src={toJS(bag.tb.viewState, { recurseEverything: true })}
                            name={'[DEBUG view state]'}
                        />
                        Form is {bag.tb.isValid || 'not'} valid
                    </Alert>
                );
            })
        )
    };
};
