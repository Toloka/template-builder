import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.search-query';

type SearchEngines =
    | {
          name: 'yandex';
          regionId?: string;
          family?: string;
      }
    | {
          name: 'yandex/video';
          family?: string;
      }
    | {
          name: 'yandex/images';
          family?: string;
      }
    | {
          name: 'google';
      }
    | {
          name: 'bing';
      }
    | {
          name: 'mail.ru';
      }
    | {
          name: 'wikipedia';
      }
    | {
          name: 'yandex/collections';
      }
    | {
          name: 'google/images';
      }
    | {
          name: 'yandex/news';
      }
    | {
          name: 'google/news';
      }
    | {
          name: undefined;
      };

export type HelperSearchQueryProps = {
    engine?: SearchEngines | SearchEngines['name'];
    query: string;
};

const getSearchLink = (engine: SearchEngines, query: string) => {
    const encodedQuery = encodeURIComponent(query);

    switch (engine.name) {
        case 'yandex':
            return `https://yandex.ru/search/?text=${encodedQuery}${engine.regionId ? `&lr=${engine.regionId}` : ''}${
                engine.family ? `&family=${engine.family}` : ''
            }`;
        case 'google':
            return `https://www.google.ru/search?q=${encodedQuery}`;
        case 'bing':
            return `https://www.bing.com/search?q=${encodedQuery}`;
        case 'mail.ru':
            return `https://go.mail.ru/search?q=${encodedQuery}`;
        case 'wikipedia':
            return `https://ru.wikipedia.org/wiki/${encodedQuery}`;
        case 'yandex/collections':
            return `https://yandex.ru/collections/search/boards/?text=${encodedQuery}`;
        case 'yandex/video':
            return `https://yandex.ru/video/search?text=${encodedQuery}${
                engine.family ? `&family=${engine.family}` : ''
            }`;
        case 'yandex/images':
            return `https://yandex.ru/images/search?text=${encodedQuery}${
                engine.family ? `&family=${engine.family}` : ''
            }`;
        case 'google/images':
            return `https://www.google.ru/search?q=${encodedQuery}&tbm=isch`;
        case 'yandex/news':
            return `https://news.yandex.ru/yandsearch?text=${encodedQuery}&rpt=nnews2`;
        case 'google/news':
            return `https://news.google.com/search?q=${encodedQuery}&tbm=nws`;
    }

    // for engines we did not cover yet (yep, used in production)
    return encodedQuery;
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperSearchQueryProps, string>(({ engine, query }: HelperSearchQueryProps) => {
            return getSearchLink(typeof engine === 'object' ? engine : { name: engine }, query);
        })
    };
};
