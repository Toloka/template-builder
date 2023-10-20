import { computed, observable } from 'mobx';
import isEqual from 'react-fast-compare';

import { CtxBag } from '../ctx/ctxBag';
import { resolveGetters } from '../resolveGetters/resolveGetters';
import { AnyAction } from './helpers/action';

export type Matchable<T> = {
    action: AnyAction;
    bag: CtxBag;
    matchingValue: T;
};

export type ActionMatcher<T> = {
    match: (populatedAction: AnyAction, actionBag: CtxBag) => T | undefined;
    add: (matchable: Matchable<T>) => () => void;
};

const serializeActionDataAndView = (populatedAction: AnyAction, bag: CtxBag) => {
    const data = populatedAction.data;
    const view = populatedAction.view;

    return {
        ...populatedAction,
        data: data ? `${data.getForm(bag)}.${data.getPath(bag)}` : undefined,
        view: view ? view.__configPath : undefined
    };
};

const compareSerializedActions = (
    action1: ReturnType<typeof serializeActionDataAndView>,
    action2: ReturnType<typeof serializeActionDataAndView>
) => {
    // these are compared as strings
    if (action1.type !== action2.type) {
        return false;
    }

    if (action1.data !== action2.data) {
        return false;
    }

    if (action1.view !== action2.view) {
        return false;
    }

    // deepEqual of resolved action payloads
    return isEqual(action1.payload, action2.payload);
};

export const makeActionMatcher = <T>(matchables: Array<Matchable<T>>): ActionMatcher<T> => {
    const base = observable([...matchables]);

    const resolved = computed(() =>
        base.reduce((acc, matchable) => {
            const resolvedAction = resolveGetters(matchable.action, matchable.bag);

            if (resolvedAction) {
                acc.push({
                    matchingValue: matchable.matchingValue,
                    action: serializeActionDataAndView(resolvedAction, matchable.bag)
                });
            }

            return acc;
        }, [] as Array<{ matchingValue: T; action: ReturnType<typeof serializeActionDataAndView> }>)
    );

    return {
        match: (resolvedAction: AnyAction, actionBag: CtxBag) => {
            const comparableAction = serializeActionDataAndView(resolvedAction, actionBag);
            const currentResolved = resolved.get();

            for (const matchable of currentResolved) {
                if (compareSerializedActions(matchable.action, comparableAction)) {
                    return matchable.matchingValue;
                }
            }
        },
        add: (matchable: Matchable<T>) => {
            base.push(matchable);

            return () => {
                const idx = base.indexOf(matchable);

                base.splice(idx, 1);
            };
        }
    };
};
