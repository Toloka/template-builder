import { useCallback, useEffect, useMemo, useState } from 'react';

export const useImageLoading = (
    url: string,
    errorLoadFailed: string
): [string | undefined, () => void, boolean, () => void, boolean] => {
    const [error, setError] = useState<string | undefined>();

    // https://stackoverflow.com/questions/50690956/react-img-not-immediately-changing-when-src-changes-how-can-i-fix-this
    const [forcedImgReflow, setForcedImgReflow] = useState(false);

    useEffect(() => {
        if (forcedImgReflow) setForcedImgReflow(false);
    }, [forcedImgReflow]);

    const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

    const loading = useMemo(() => loadedImageUrl !== url, [loadedImageUrl, url]);

    useEffect(() => {
        return () => {
            if (loadedImageUrl !== url) {
                setLoadedImageUrl(null);
                setError(undefined);
            }
            setForcedImgReflow(true);
        };
        // loadedImageUrl in deps causes infinite repaint
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const onLoad = useCallback(() => {
        setLoadedImageUrl(url);
        setError(undefined);
    }, [url]);
    const onError = useCallback(() => {
        setError(errorLoadFailed);
    }, [errorLoadFailed]);

    return [error, onError, loading, onLoad, forcedImgReflow];
};
