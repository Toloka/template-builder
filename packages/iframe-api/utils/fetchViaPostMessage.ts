import { isAllowedOrigin } from '../isAllowedOrigin';
import { makePostMessageRequest } from '../rpc';

const defaultTimeout = 10000;

export const fetchViaPostMessage = (params: { url: string; requestInit?: object }): Promise<string | Error> => {
    return new Promise<string | Error>((resolve, reject) => {
        let rejected = false;

        const timer = setTimeout(() => {
            rejected = true;
            reject();
        }, defaultTimeout);

        makePostMessageRequest(window.parent, 'fetch', params).then((response) => {
            clearTimeout(timer);

            if (rejected) {
                return reject(new Error(`Response received after timeout`));
            }

            if (!isAllowedOrigin(response.originalEvent.origin)) {
                return reject(new Error(`Origin ${window.parent.origin} not allowed [fetch response]`));
            }

            if (response.data === '') {
                return reject(new Error('Empty response'));
            }

            if (response.data instanceof Error) {
                return reject(response.data);
            }

            if (response.data === undefined) {
                // return reject(new Error('onFetch is not implemented'));

                // Temporary fallback until onFetch is implemented in DC
                fetch(params.requestInit ? new Request(params.url, params.requestInit) : params.url)
                    .then(async (response) => {
                        resolve(await response.text());
                    })
                    .catch((reason) => {
                        reject(new Error(reason));
                    });
            } else {
                resolve(response.data);
            }
        });
    });
};
