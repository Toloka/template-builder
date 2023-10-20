import { MetrikaParams } from '@toloka-tb/iframe-api/launcher.embed/protocol';

export const initializeMetrika = (metrikaParams: MetrikaParams) => {
    /* eslint-disable */
    (function(m: Window, e: Document, t: string, r: string, i: string, k?: HTMLScriptElement, a?: HTMLElement) {
        // @ts-ignore
        m[i] =
            // @ts-ignore
            m[i] ||
            function() {
                // @ts-ignore
                (m[i].a = m[i].a || []).push(arguments);
            };
        // @ts-ignore
        m[i].l = 1 * new Date();
        // @ts-ignore
        (k = e.createElement(t)),
            // @ts-ignore
            (a = e.getElementsByTagName(t)[0]),
            // @ts-ignore
            (k.async = 1),
            // @ts-ignore
            (k.src = r),
            // @ts-ignore
            a.parentNode!.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    // @ts-ignore
    ym(metrikaParams.id, 'init', metrikaParams);
    /* eslint-enable */
};
