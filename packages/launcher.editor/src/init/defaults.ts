import {
    defaultAppState,
    defaultConfig,
    defaultFeatures,
    defaultInput,
    defaultIntlState,
    defaultLock
} from '../store/defaults';

export const configState = {
    input: JSON.stringify(defaultInput(), null, 2),
    config: JSON.stringify(defaultConfig(), null, 2),
    lock: defaultLock()
};
export const features = defaultFeatures();
export const appState = defaultAppState();
export const intl = defaultIntlState();
