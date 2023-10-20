import { loadScript } from './loadScript';
import { loadStyle } from './loadStyle';

export const loadLink = (link: string) => {
    if (link.endsWith('.css')) {
        return loadStyle(link);
    } else {
        return loadScript(link, 'async', 'crossorigin');
    }
};
