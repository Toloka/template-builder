import { CoreComponentApi } from './api/coreComponentApi';
import { Action, ContextualAction, DataAction, GettableAction, ViewAction } from './api/helpers/action';
import { Child } from './api/helpers/children';
import { ConditionResult } from './api/helpers/condition';
import { FieldProps } from './api/helpers/field';
import { Plugin, SettingsPlugin } from './api/helpers/plugin';
import { UseTranslation } from './api/i18n';
import { ListProps } from './api/ui/ListLayout/ListLayout';
import { Compiler, ComponentConfig } from './compileConfig/compileConfig';

export type CreateOptions = { env: { [key: string]: any } };

export type Core = CoreComponentApi;

export {
    Child,
    FieldProps,
    DataAction,
    ViewAction,
    ContextualAction,
    ListProps,
    Action,
    GettableAction,
    Plugin,
    SettingsPlugin,
    ComponentConfig,
    ConditionResult,
    Compiler,
    UseTranslation
};
