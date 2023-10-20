import { getByPath } from './access/getByPath';
import { setByPath } from './access/setByPath';
import * as conditionUtilsContainer from './api/conditionUtils';
import * as transformers from './api/fieldTransformers';
import { actionHelper } from './api/helpers/action';
import { conditionHelper, conditionHelperV2 } from './api/helpers/condition';
import { fieldHelper, fieldWithChildrenHelper } from './api/helpers/field';
import { helperHelper } from './api/helpers/helper';
import { pluginHelper } from './api/helpers/plugin';
import { viewHelper, viewWithChildrenHelper } from './api/helpers/view';
import { useComponentActions } from './api/hooks/useComponentActions';
import { useComponentState } from './api/hooks/useComponentState';
import { useGetter } from './api/hooks/useGetter';
import { useResizeObserver } from './api/hooks/useResizeObserver';
import { useScrollStoring } from './api/hooks/useScrollStoring';
import { getSettings, useSettings } from './api/hooks/useSettings';
import * as i18n from './api/i18n';
import { ActionHint } from './api/ui/ActionHint/ActionHint';
import { hotkeyBtnTranslations } from './api/ui/ActionHint/translations';
import { Hint } from './api/ui/Hint/Hint';
import { ListContainer, ListItem } from './api/ui/ListLayout/ListLayout';
import { compileConfig, register } from './compileConfig/compileConfig';
import { CoreApi } from './coreApi';
import { nodeCtx, useCtxBag } from './ctx/nodeCtx';
import { makeCtxV2, makeEmptyCtx } from './ctx/tbCtx';
import { dataInput, DataRProps } from './data/input';
import { dataLocal } from './data/local';
import { dataRelative } from './data/relative';
import { dataInternal, dataOutput, DataRWProps } from './data/rw';
import { dataSub } from './data/sub';
import { makeGetter, resolveGetters } from './resolveGetters/resolveGetters';

// exported for init
export const isTbCore = true;

// exported for launchers
export { Tb } from './Tb/Tb';
export { register, compileConfig, makeCtxV2, makeEmptyCtx };

// export for components
export { makeActionMatcher } from './api/actionMatcher';
export { childrenFromArray } from './api/childrenFromArray';

export { externalLinks } from './api/externalLinks';

export const fieldTransformers: CoreApi['fieldTransformers'] = transformers;
export const conditionUtils: CoreApi['conditionUtils'] = conditionUtilsContainer;

export const helpers: CoreApi['helpers'] = {
    view: viewHelper,
    viewWithChildren: viewWithChildrenHelper,
    field: fieldHelper,
    fieldWithChildren: fieldWithChildrenHelper,
    action: actionHelper,
    plugin: pluginHelper,
    condition: conditionHelper,
    conditionV2: conditionHelperV2,
    helper: helperHelper,
    access: {
        setByPath,
        getByPath
    },
    getSettings
};

export const hooks: CoreApi['hooks'] = {
    useComponentActions,
    useComponentState,
    useSettings,
    useScrollStoring,
    useResizeObserver,
    useGetter
};

export { i18n };

export const ui: CoreApi['ui'] = {
    list: {
        ListContainer,
        ListItem
    },
    Hint,
    ActionHint
};

export const data: CoreApi['data'] = {
    sub: dataSub
};

export const _lowLevel: CoreApi['_lowLevel'] = {
    nodeCtx,
    useCtxBag,
    makeGetter,
    resolveGetters
};

// register low-level components
register<DataRProps>({ type: 'data.input', compile: dataInput, options: { shallowKeys: ['schema'] } });
register<DataRWProps<unknown>>({ type: 'data.internal', compile: dataInternal });
register<DataRWProps<unknown>>({ type: 'data.output', compile: dataOutput });
register<DataRWProps<unknown>>({ type: 'data.relative', compile: dataRelative });
register<DataRProps>({ type: 'data.local', compile: dataLocal });

// core is a component too
export const translations = hotkeyBtnTranslations;
export const create = () => ({
    type: 'core',
    compile: helperHelper(() => undefined)
});
