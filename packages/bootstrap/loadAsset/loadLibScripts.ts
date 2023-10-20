import { loadScript } from './loadScript';

let libPromise: Promise<unknown> | undefined;

export const loadLibScripts = () => {
    if (!libPromise) {
        libPromise = Promise.all(
            process.env.TB_LIBS === 'production'
                ? [
                      loadScript(
                          'https://tlkfrontprod.azureedge.net/template-builder-production/static/react-with-dom@16.12.0/react-with-dom.16.12.0.min.js',
                          'defer'
                      ),
                      loadScript(
                          'https://tlkfrontprod.azureedge.net/template-builder-production/static/mobx@5.15.4/mobx.5.15.4.min.js',
                          'async'
                      ),
                      loadScript(
                          'https://tlkfrontprod.azureedge.net/template-builder-production/static/react-intl@5.10.0/react-intl.5.10.0.min.js',
                          'defer'
                      )
                  ]
                : [
                      loadScript('https://unpkg.com/react@16/umd/react.development.js', 'defer', 'crossorigin'),
                      loadScript('https://unpkg.com/react-dom@16/umd/react-dom.development.js', 'defer', 'crossorigin'),
                      loadScript('https://unpkg.com/mobx@5.15.4/lib/mobx.umd.js', 'async', 'crossorigin'),
                      loadScript('https://unpkg.com/react-intl@5.10.0/react-intl.umd.js', 'defer', 'crossorigin')
                  ]
        );
    }

    return libPromise;
};
