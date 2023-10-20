import React, { HTMLAttributes } from 'react';

const sizes = {
    s: 12,
    m: 16,
    l: 24,
} as const;

type Props = {
    size?: 's' | 'm' | 'l';
    exactSize?: number;
    color?: string;
} & HTMLAttributes<SVGElement>;

const style: React.CSSProperties = {
    verticalAlign: 'middle',
};

export const PlayFilledIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
    const size = exactSize || sizes[shortSize || 'm'] || 16;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            style={style}
            {...restProps}
            role="img"
            focusable="false"
            aria-labelledby="icon Play Filled"
        >
            <path
                d="M4.5098 0.897445C3.8432 0.502422 3 0.98288 3 1.75774V14.2478C3 15.0226 3.8432 15.5031 4.5098 15.108L15.0483 8.86304C15.7019 8.47572 15.7019 7.52977 15.0483 7.14246L4.5098 0.897445Z"
                fill={color}
            />
        </svg>
    );
};
