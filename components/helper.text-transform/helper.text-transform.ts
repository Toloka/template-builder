import { Core } from '@toloka-tb/core/coreComponentApi';

const type = 'helper.text-transform';

export type HelperReplaceProps = {
    data: string;
    transformation: 'uppercase' | 'lowercase' | 'capitalize';
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.helper<HelperReplaceProps, string>(({ data, transformation }) => {
            if (data === undefined) {
                return '';
            }
            if (typeof data !== 'string') {
                return String(data);
            }
            switch (transformation) {
                case 'capitalize':
                    return `${data.substr(0, 1).toUpperCase()}${data.substr(1).toLowerCase()}`;
                case 'lowercase':
                    return data.toLowerCase();
                case 'uppercase':
                    return data.toUpperCase();
                default:
                    return data;
            }
        })
    };
};
