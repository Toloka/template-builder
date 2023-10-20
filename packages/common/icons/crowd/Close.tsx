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

export const CloseIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
    const size = exactSize || sizes[shortSize || 'm'] || 16;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            style={style}
            {...restProps}
            role="img"
            focusable="false"
            aria-labelledby="icon Close"
        >
            <path d="M4.5858 6l-3.293-3.2929c-.3904-.3905-.3904-1.0237 0-1.4142.3906-.3905 1.0238-.3905 1.4143 0L6 4.5858l3.2929-3.293c.3905-.3904 1.0237-.3904 1.4142 0 .3905.3906.3905 1.0238 0 1.4143L7.4142 6l3.293 3.2929c.3904.3905.3904 1.0237 0 1.4142-.3906.3905-1.0238.3905-1.4143 0L6 7.4142l-3.2929 3.293c-.3905.3904-1.0237.3904-1.4142 0-.3905-.3906-.3905-1.0238 0-1.4143L4.5858 6z" />
        </svg>
    );
};
