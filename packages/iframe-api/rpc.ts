import { IframeError, IframeProtocol, IframeRequest, IframeResponse, WithEvent } from './protocol';
import { uniqueId } from './utils/uniqueId';

const listenForResponse = <T extends keyof IframeProtocol>(targetWindow: Window, id: IframeRequest<T>['id']) =>
    new Promise<WithEvent<IframeResponse<T> | IframeError>>((resolve) => {
        const listener = (event: MessageEvent) => {
            if (targetWindow !== event.source) return;

            const data: IframeResponse<T> | IframeError | IframeRequest<any> = event.data;

            if (data.__tbIframeAction !== 'response') return;

            if (data.id === id) {
                window.removeEventListener('message', listener);
                resolve({ ...data, originalEvent: event });
            }
        };

        window.addEventListener('message', listener);
    });

export const makePostMessageRequest = async <T extends keyof IframeProtocol>(
    targetWindow: Window | null,
    method: T,
    payload: IframeRequest<T>['payload']
): Promise<WithEvent<IframeResponse<T>>> => {
    if (!targetWindow) {
        throw Error('No content window present for an iframe');
    }

    const id = uniqueId();
    const request: IframeRequest<T> = { method, payload, id, __tbIframeAction: 'request' };

    targetWindow.postMessage(request, '*');

    const response = await listenForResponse<T>(targetWindow, id);

    if (!response.ok) {
        throw Error(
            `tb iframe request failed: ${response.error}. Request: ${JSON.stringify(request)} from: ${window.location}`
        );
    }

    return response;
};

export type ReactionMap = Partial<
    {
        [T in keyof IframeProtocol]: (
            requestPayload: IframeRequest<T>['payload']
        ) => Promise<IframeResponse<T>['data']> | IframeResponse<T>['data'];
    }
>;

export const addPostMessageReactions = (checkLegitimacy: (event: MessageEvent) => boolean, handlerMap: ReactionMap) => {
    const listener = async (event: MessageEvent) => {
        if (!checkLegitimacy(event) || !event.source) return;
        if (!event.data.__tbIframeAction || !event.data.method) return;

        let response: IframeResponse<any> | IframeError = {
            ok: false,
            id: event.data.id,
            error: `Unknown method ${event.data.method}`,
            __tbIframeAction: 'response'
        };

        const handler = handlerMap[event.data.method as keyof IframeProtocol];

        if (handler) {
            const request: IframeRequest<any> = event.data;

            try {
                const data = await (handler as any)(request.payload);

                response = {
                    data,
                    ok: true,

                    id: response.id,
                    __tbIframeAction: 'response'
                };
            } catch (error) {
                response = {
                    error: `Caught error: ${error}`,
                    ok: false,

                    id: response.id,
                    __tbIframeAction: 'response'
                };
            }
        }

        (event.source as Window).postMessage(response, '*');
    };

    window.addEventListener('message', listener);

    return () => window.removeEventListener('message', listener);
};
