import { EditorProtocol } from './launcher.editor/protocol';
import { EmbedProtocol } from './launcher.embed/protocol';
import { TranslateProtocol } from './launcher.translate/protocol';

type Id = string;

export type IframeProtocol = EditorProtocol & EmbedProtocol & TranslateProtocol;

export type IframeRequest<T extends keyof IframeProtocol> = {
    method: T;
    id: Id;
    payload: IframeProtocol[T]['request'];
    __tbIframeAction: 'request';
};

export type IframeResponse<T extends keyof IframeProtocol> = {
    id: Id;
    ok: true;
    data: IframeProtocol[T]['response'];
    __tbIframeAction: 'response';
};

export type IframeError = {
    id: Id;
    ok: false;
    error: string;
    __tbIframeAction: 'response';
};

export type WithEvent<T> = T & { originalEvent: MessageEvent };
