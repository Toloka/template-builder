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

export const PauseFilledIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
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
            aria-labelledby="icon Pause Filled"
        >
            <path
                d="M4 1.00275C3.44772 1.00275 3 1.45046 3 2.00275V14.0027C3 14.555 3.44772 15.0027 4 15.0027H6C6.55228 15.0027 7 14.555 7 14.0027V2.00275C7 1.45046 6.55228 1.00275 6 1.00275H4ZM10 1.00275C9.44772 1.00275 9 1.45046 9 2.00275V14.0027C9 14.555 9.44772 15.0027 10 15.0027H12C12.5523 15.0027 13 14.555 13 14.0027V2.00275C13 1.45046 12.5523 1.00275 12 1.00275H10Z"
                fill={color}
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    );
};
