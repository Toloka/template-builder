import { Action, DataAction, ViewAction } from '../api/helpers/action';
import { ViewConfig } from '../api/helpers/view';
import { resolveGetters } from '../resolveGetters/resolveGetters';
import { CtxBag } from './ctxBag';

const makeViewProxy = (view: ViewConfig, bag: CtxBag) => {
    // this is a weird hack to deal with dynamic list
    // basically means: use last node with this config if it is key from compilation or use node-key directly
    // (node key is assigned to the view by ActionHint and useComponentActions )
    const key = bag.tb.viewKey2NodeKey[view.__tbViewKey] || view.__tbViewKey;

    return {
        ...view,
        get props() {
            return resolveGetters(view.props, bag);
        },
        get state() {
            return bag.tb.viewState[key];
        },
        set state(newState: unknown) {
            bag.tb.viewState[key] = newState;
        }
    };
};

export const addProxy = (populatedAction: Action | DataAction | ViewAction, bag: CtxBag) => {
    if ('data' in populatedAction && populatedAction.data) {
        return {
            ...populatedAction,
            data: populatedAction.data.makeProxy(bag)
        };
    }

    if ('view' in populatedAction && populatedAction.view) {
        return {
            ...populatedAction,
            view: makeViewProxy(populatedAction.view, bag)
        };
    }

    return populatedAction;
};
