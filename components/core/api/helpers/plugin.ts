import { CtxBag } from '../../ctx/ctxBag';
import { Compile, compiler } from '../../resolveGetters/resolveGetters';
import { ActionMatcher } from '../actionMatcher';
import { Action } from './action';

export type ActionPlugin<S = any> = {
    name: string;
    match: ActionMatcher<any>['match'];
    type: 'action';
    settings?: S;
    destroy?: () => void;
};
export type SettingsPlugin<S = any> = {
    settings: S;
    type: 'settings';
    destroy?: () => void;
};
export type EffectPlugin = { name: string; type: 'effect'; destroy?: () => void };

export interface ConfigContext {
    todo: Action[];
}

export type PluginCompiled = ActionPlugin | SettingsPlugin | EffectPlugin;
export type Plugin<PC = PluginCompiled> = {
    init: (bag: CtxBag) => PC;
};

export type PluginHelper = <T>(baseCompiler: (props: T) => Plugin) => Compile<T, Plugin>;

export const pluginHelper: PluginHelper = compiler;
