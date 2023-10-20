import { ConfigState, EditorAppState } from '@toloka-tb/iframe-api/launcher.editor/protocol';

import { Features } from '../store/features';
import { IntlStore } from '../store/intlStore';
import { getInitParamsIframe } from './getInitParamsIframe';
import { getInitParamsStandalone } from './getInitParamsStandalone';

const isIframe = new URLSearchParams(location.search.toLowerCase()).has('embed');

type InitParams = {
    appState: EditorAppState;
    features: Features;
    configState: ConfigState;
    intl: IntlStore;
    registryPrereleaseTag: string;
};
export type GetInitParams = () => Promise<InitParams | undefined>;

export const getInitParams: GetInitParams = isIframe ? getInitParamsIframe : getInitParamsStandalone;
