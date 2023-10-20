import { useMemo } from 'react';

import { CtxBag } from '../../ctx/ctxBag';
import { useCtxBag } from '../../ctx/nodeCtx';
import { SettingsPlugin } from '../helpers/plugin';

export const getSettings = <SettingsControl = any>(
    controlName: keyof SettingsControl,
    ctxBag: CtxBag
): SettingsControl[typeof controlName] => {
    const plugin = ctxBag.tb.plugins.find(
        (plugin) => 'settings' in plugin && plugin.settings[controlName]
    ) as SettingsPlugin;

    return plugin && plugin.settings[controlName];
};

export const useSettings = <SettingsControl = any>(controlName: keyof SettingsControl) => {
    const ctxBag = useCtxBag();

    const settings = useMemo(() => getSettings<SettingsControl>(controlName, ctxBag), [controlName, ctxBag]);

    return settings;
};
