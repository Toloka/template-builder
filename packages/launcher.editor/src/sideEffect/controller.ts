import { featuresStore } from '../store/features';
import { initOutputControllerIframe } from './initControllerIframe';
import { initOutputControllerStandalone } from './initControllerStandalone';

const isIframe = new URLSearchParams(location.search.toLowerCase()).has('embed');

export const controller = isIframe ? initOutputControllerIframe() : initOutputControllerStandalone();
