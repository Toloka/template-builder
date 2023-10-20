import { retryOnError } from './loadScript';

export const loadStyle = (url: string, attempts = 0) =>
    new Promise((resolve, reject) => {
        const style = document.createElement('link');

        style.onload = resolve;
        style.onerror = retryOnError(() => loadStyle(url, attempts + 1), resolve, reject, attempts, {
            name: 'TB_STYLE_LOADING_ERROR',
            url
        });

        style.rel = 'stylesheet';
        style.href = url;

        document.getElementsByTagName('head')[0].appendChild(style);
    });
