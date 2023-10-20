import { getByPath } from '../access/getByPath';
import { nodeCtx, useCtxBag } from '../ctx/nodeCtx';
import { dataSub } from '../data/sub';
import { makeGetter, resolveGetters } from '../resolveGetters/resolveGetters';
import { setByPath } from './../access/setByPath';
import { ActionMatcher, Matchable } from './actionMatcher';
import { childrenFromArray } from './childrenFromArray';
import * as conditionUtils from './conditionUtils';
import { externalLinks } from './externalLinks';
import * as transformers from './fieldTransformers';
import { actionHelper } from './helpers/action';
import { conditionHelper, conditionHelperV2 } from './helpers/condition';
import { fieldHelper, fieldWithChildrenHelper } from './helpers/field';
import { helperHelper } from './helpers/helper';
import { pluginHelper } from './helpers/plugin';
import { viewHelper, viewWithChildrenHelper } from './helpers/view';
import { useComponentActions } from './hooks/useComponentActions';
import { useComponentState } from './hooks/useComponentState';
import { useGetter } from './hooks/useGetter';
import { useResizeObserver } from './hooks/useResizeObserver';
import { useScrollStoring } from './hooks/useScrollStoring';
import { getSettings, useSettings } from './hooks/useSettings';
import * as i18n from './i18n';
import { ActionHint } from './ui/ActionHint/ActionHint';
import { Hint } from './ui/Hint/Hint';
import { ListContainer, ListItem } from './ui/ListLayout/ListLayout';

export type CoreComponentApi = {
    helpers: {
        view: typeof viewHelper;
        viewWithChildren: typeof viewWithChildrenHelper;
        field: typeof fieldHelper;
        fieldWithChildren: typeof fieldWithChildrenHelper;
        action: typeof actionHelper;
        plugin: typeof pluginHelper;
        condition: typeof conditionHelper;
        conditionV2: typeof conditionHelperV2;
        helper: typeof helperHelper;
        access: {
            setByPath: typeof setByPath;
            getByPath: typeof getByPath;
        };
        getSettings: typeof getSettings;
    };

    hooks: {
        useSettings: typeof useSettings;
        useComponentState: typeof useComponentState;
        useComponentActions: typeof useComponentActions;
        useScrollStoring: typeof useScrollStoring;
        useResizeObserver: typeof useResizeObserver;
        useGetter: typeof useGetter;
    };

    i18n: typeof i18n;

    externalLinks: typeof externalLinks;

    fieldTransformers: typeof transformers;
    conditionUtils: typeof conditionUtils;
    childrenFromArray: typeof childrenFromArray;

    ui: {
        list: {
            ListContainer: typeof ListContainer;
            ListItem: typeof ListItem;
        };
        Hint: typeof Hint;
        ActionHint: typeof ActionHint;
    };

    data: {
        sub: typeof dataSub;
    };

    makeActionMatcher: <A>(action: Array<Matchable<A>>) => ActionMatcher<A>;

    _lowLevel: {
        nodeCtx: typeof nodeCtx;
        useCtxBag: typeof useCtxBag;
        makeGetter: typeof makeGetter;
        resolveGetters: typeof resolveGetters;
    };
};
