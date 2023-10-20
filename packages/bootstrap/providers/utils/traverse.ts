import { TbJsonConfig } from '../../domain';

export const traverse = (config: TbJsonConfig, reaction: (value: unknown) => void) => {
    const doTraverse = (value: unknown) => {
        reaction(value);

        if (!value) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(doTraverse);
        } else if (typeof value === 'object' && value) {
            Object.keys(value).forEach((key) => doTraverse(value[key as keyof typeof value]));
        }
    };

    doTraverse(config);
};
