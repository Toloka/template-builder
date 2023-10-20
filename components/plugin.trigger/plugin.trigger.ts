import { Action, Core, Plugin } from '@toloka-tb/core/coreComponentApi';
import { CtxBag } from '@toloka-tb/core/ctx/ctxBag';
import { R } from '@toloka-tb/core/resolveGetters/resolveGetters';
import { reaction } from 'mobx';

const type = 'plugin.trigger';

type PluginTriggerProps = {
    action: Action;
    onChangeOf: R<unknown>;
    condition?: boolean;
    fireImmediately?: boolean;
};

export const create = (core: Core) => {
    const resolveGetters = core._lowLevel.resolveGetters;

    return {
        type,
        compile: core.helpers.plugin(
            (props: PluginTriggerProps): Plugin => {
                return {
                    init: (bag: CtxBag) => {
                        let isAutoFirstRun = props.fireImmediately;

                        reaction(
                            () => resolveGetters(props.onChangeOf, bag),

                            (observableData) => {
                                const observableIsPrimitive =
                                    typeof observableData !== 'object' || observableData === null;
                                const dataLocal = observableIsPrimitive
                                    ? observableData
                                    : { ...bag.data.local, ...observableData };
                                const subBag: CtxBag = {
                                    ...bag,
                                    data: { ...bag.data, local: dataLocal },
                                    component: { ...bag.component, data: observableData }
                                };

                                const conditionPassed = props.condition
                                    ? resolveGetters(props.condition, subBag)
                                    : true;

                                if (conditionPassed) {
                                    // only use NoChange marker for automatic runs
                                    if (isAutoFirstRun) {
                                        isAutoFirstRun = false;

                                        const touchOnChange = bag.tb.touchOnChange;

                                        bag.tb.touchOnChange = false;
                                        try {
                                            bag.tb.dispatch(props.action, subBag);
                                        } catch (err) {
                                            bag.tb.touchOnChange = touchOnChange;
                                            throw err;
                                        }

                                        bag.tb.touchOnChange = touchOnChange;
                                    } else {
                                        bag.tb.dispatch(props.action, subBag);
                                    }
                                }
                            },
                            { fireImmediately: props.fireImmediately }
                        );

                        return { type: 'settings', settings: {}, controls: [] };
                    }
                };
            }
        )
    };
};
