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

export const CalendarIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
    const size = exactSize || sizes[shortSize || 'm'] || 16;

    return (
        <svg
            width={size}
            height={size}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            style={style}
            {...restProps}
            role="img"
            focusable="false"
            aria-labelledby="icon Calendar"
        >
            <path
                d="M4 14v-3h3.001v3H4zm0-4V7h3v3H4zm-4 4v-3h3v3H0zm0-4V6.999h3V10H0zm8 0V7h3v3H8zm0 4v-3h3v3H8zm0-8V3h3v3H8zm4 4V6.999h3.001V10H12zm0-4V3h3.001v3H12zM4 6V3h3.001v3H4z"
                fill={color}
                stroke="none"
                strokeWidth="1"
                fillRule="evenodd"
            />
        </svg>
    );
};
