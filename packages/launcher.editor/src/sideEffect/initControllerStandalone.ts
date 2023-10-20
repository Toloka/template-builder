import { editorI18n } from '../i18n/editorI18n';
import { AppState, appStore } from '../store/appStore';
import { configStore } from '../store/configStore';
import { inputStore } from '../store/inputStore';
import { LZString } from '../utils/lzw';

const noop = () => {
    /* noop */
};

const makeExportUrl = (config: string, input: string) => {
    let url = `${location.origin}${location.pathname}?config=${LZString.compressToEncodedURIComponent(
        JSON.stringify({ config, input })
    )}`;

    const urlParams = new URLSearchParams(location.search);

    urlParams.forEach((value, key) => {
        if (key !== 'config') {
            url += `&${key}`;
            if (value) {
                url += `=${value}`;
            }
        }
    });

    return url;
};

export const initOutputControllerStandalone = () => {
    const setFullscreen = async (enabled: boolean) => {
        appStore.isFullscreen = enabled;
    };

    const setPaneOpen = async (pane: keyof AppState['paneIsOpen'], isOpen: boolean) => {
        appStore.paneIsOpen[pane] = isOpen;
    };

    const sessionDate = new Date();

    const onConfigChange = async () => {
        const exportUrl = makeExportUrl(configStore.current, inputStore.current);

        history.replaceState({}, `${editorI18n.t('title')} ${sessionDate.toLocaleString()}`, exportUrl);
    };

    const onConfigEditorChange = noop;
    const onPreviewSubmit = noop;
    const onPreviewReset = noop;
    const onChangeInputDataConfig = noop;

    return {
        setPaneOpen,
        setFullscreen,
        onConfigChange,
        onConfigEditorChange,
        onPreviewSubmit,
        onPreviewReset,
        onChangeInputDataConfig
    };
};
