import React from 'react';
import { ExtractProps } from '@bem-react/core';
import { Tumbler as LegoTumbler } from '@yandex/ui/Tumbler/desktop/bundle';

export type TumblerProps = ExtractProps<typeof LegoTumbler>;

const defaultProps: Pick<TumblerProps, 'view' | 'size'> = {
    view: 'default',
    size: 'm',
};

export const Tumbler: React.FC<TumblerProps> = props => {
    const { size, ...restProps } = props;

    return (
        // TODO: lego has type problems with size param in v2.5.18 or earlier
        // @ts-ignore
        <LegoTumbler {...defaultProps} {...restProps} />
    );
};
