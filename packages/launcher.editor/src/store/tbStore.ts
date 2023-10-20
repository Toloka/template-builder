import { JSONSchema7 } from 'json-schema';

import { shallowObservable } from './shallowObservable';

export type TbState = {
    editors: {
        [type: string]: { schema?: JSONSchema7; internal?: boolean };
    };
};

export const tbStore = shallowObservable<TbState>({
    editors: {}
});
