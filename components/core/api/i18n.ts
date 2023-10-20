import { useCallback } from 'react';

import { CtxBag } from '../ctx/ctxBag';
import { useCtxBag } from '../ctx/nodeCtx';

export type TranslationFunction<Key extends string> = (key: Key, values?: { [key: string]: string | number }) => string;

const t = <V extends Record<string, any>>(ctxBag: CtxBag, type: string, key: string, values?: V) => {
    return ctxBag.tb.intl.formatMessage({ id: `${type}_${key}`, defaultMessage: key }, values);
};

export const makeTranslator = <Key extends string = string>(ctxBag: CtxBag, type: string): TranslationFunction<Key> => (
    key,
    values?
) => t(ctxBag, type, key, values);

export const useTranslation = <Key extends string = string>(type: string) => {
    const ctxBag = useCtxBag();

    // a bit of type magic that works like this: React element was passed -> React.ReactNode, only string / numbers / etc -> string
    return useCallback(
        <V>(key: Key, values?: V) => {
            return t(ctxBag, type, key, values);
        },
        [type, ctxBag]
    );
};

export type UseTranslation<Key extends string> = (type: string) => <V>(key: Key, values?: V) => string;

export const useCurrentLocale = () => useCtxBag().tb.intl.locale;
