import { noChildren } from '../api/helpers/children';
import { FieldConfig } from '../api/helpers/field';
import { ViewConfig } from '../api/helpers/view';
import { ComponentConfig } from '../compileConfig/compileConfig';
import { DataRW } from '../data/rw';
import { TbNode } from './lifeCycle/lifeCycleTypes';
import { TbCtx } from './tbCtx';

// utils
export const noView: ViewConfig = {
    props: {},

    component: () => null,
    options: {
        unresolvableProps: [],
        showLabel: false,
        showHintInLabel: false
    },
    children: noChildren,

    __tbView: true,
    __tbViewKey: 'no-view',

    __tbCompiled: true,
    __configPath: ''
};

const dataError = new Error('Attempt to get component context .data outside of any field');

export const noData: DataRW<any> = {
    __tbGettable: true,
    __dataType: 'no-data',
    set: () => {
        throw dataError;
    },
    get: () => {
        throw dataError;
    },
    getPath: () => {
        throw dataError;
    },
    getForm: () => {
        throw dataError;
    },
    makeProxy: () => {
        throw dataError;
    },
    getDefault: () => {
        throw dataError;
    },
    applyDefault: () => {
        throw dataError;
    },
    getTouched: () => {
        throw dataError;
    },
    isValueInUse: () => {
        throw dataError;
    },
    setValueInUse: () => {
        throw dataError;
    },
    resurrect: () => {
        throw dataError;
    },
    bury: () => {
        throw dataError;
    }
};

// data
export type DataCtx = {
    relative: Array<DataRW<any>>;
    local: {
        [key: string]: unknown;
    };
};

export const emptyDataCtx: DataCtx = {
    relative: [noData],
    local: {}
};

// component
export type TBComponentCtx<T = any> = {
    view: ComponentConfig;
    data: DataRW<T>;
    __tbViewKey: string;
};

export const defaultTbComponentCtx = { view: noView, data: noData, __tbViewKey: 'null' }; // 'null' instead of '' to prevent unexpected boolean casting

// whole bag
export type CtxBag = {
    tb: TbCtx;
    component: TBComponentCtx;
    node: TbNode | undefined;
    data: DataCtx;
    conditionResolvingMode: 'boolean' | 'detailed';
    showAllErrors: boolean;
};

const defaultBag: Omit<CtxBag, 'tb'> = {
    node: undefined,
    component: defaultTbComponentCtx,
    data: emptyDataCtx,
    conditionResolvingMode: 'boolean',
    showAllErrors: false
};

// factories
export const makeCtxBag = (
    tb: CtxBag['tb'],
    {
        data = emptyDataCtx,
        component = defaultTbComponentCtx,
        conditionResolvingMode = 'boolean',
        node,
        showAllErrors = false
    }: Partial<CtxBag> = defaultBag
): CtxBag => ({
    component,
    tb,
    data,
    conditionResolvingMode,
    node,
    showAllErrors
});

export const makeComponentCtx = (config: ViewConfig | FieldConfig) => ({
    view: config,
    // see lifeCycle.ts is overrides this
    __tbViewKey: config.__tbViewKey,
    data: '__tbField' in config ? config.data : noData
});
