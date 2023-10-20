import { getByPath } from '../access/getByPath';
import { setByPath } from '../access/setByPath';
import { CtxBag } from '../ctx/ctxBag';

const openedLinksStoreName = '__openedLinksMap';

let openLink = (url: string) => window.open(url, '_blank');

export const externalLinks = {
    setOpenLink: (opener: typeof openLink) => {
        openLink = opener;
    },
    open: (ctxBag: CtxBag, url: string) => {
        setByPath(ctxBag.tb.internal.value, [openedLinksStoreName, url], true);
        openLink(url);
    },
    markLinkAsOpened: (ctxBag: CtxBag, url: string) => {
        setByPath(ctxBag.tb.internal.value, [openedLinksStoreName, url], true);
    },
    wasOpened: (ctxBag: CtxBag, url: string) =>
        Boolean(getByPath(ctxBag.tb.internal.value, [openedLinksStoreName, url]))
};
