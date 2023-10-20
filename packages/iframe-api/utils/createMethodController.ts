import { IframeProtocol } from '../protocol';
import { makePostMessageRequest } from '../rpc';
import { DeepPartial } from './deepPartial';

/* Quick explanation of init order:
    1. child sends: `ready` (iframe bootstrap js loaded)
    2. parent uses caches and responds with initialState
    3. child starts bootstrap
    4. child applies initialState (that was received on step 2)
    5. child sends: `started` (iframe bootstrap has downloaded dependencies)
    6. Any call to setConfigState or setAppState or whatever is applied immediately
*/
export const createMethodController = <Method extends keyof IframeProtocol, T = IframeProtocol[Method]['request']>(
    method: Method,
    merge: (patch: DeepPartial<T>, newPatch: DeepPartial<T>) => DeepPartial<T>,
    options: {
        iframe: HTMLIFrameElement;
        startedPromise: Promise<unknown>;
        getIsReady: () => boolean;
        onChange?: (value: T) => void;
        getState?: () => Promise<T>;
    }
) => {
    let queuedPatch: DeepPartial<T> = {};
    let value: T;

    const get = async ({ force = false } = {}) => {
        if (!force) {
            // force is internal flag to fiddle with initialValue & patches
            await options.startedPromise;

            if (options.getState) {
                value = await options.getState();
            }
        }

        return value;
    };
    const set = async (
        patch: DeepPartial<T>,
        { messageChild = true }: { messageChild: boolean } = { messageChild: true }
    ) => {
        if (options.getIsReady()) {
            // if patches no longer work, wait till started & set value directly
            await options.startedPromise;

            if (options.getState) {
                value = await options.getState();
            }

            value = merge(value, patch) as T;
            if (messageChild) {
                await makePostMessageRequest(options.iframe.contentWindow, method, value);
            }

            if (options.onChange) {
                options.onChange(value);
            }
        } else {
            // if patches should be used, use them & resolve when patches actually take effect
            queuedPatch = merge(queuedPatch, patch);
            await options.startedPromise;
        }
    };

    return {
        get,
        set,
        setInitial: (initialValue: T) => {
            value = merge(initialValue, queuedPatch) as T;
            if (options.onChange) options.onChange(value);
        }
    };
};
