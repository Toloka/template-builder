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

export const CloseOutlineIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
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
            aria-labelledby="icon Close Outline"
        >
            <path
                d="M0 8.00275C0 12.421 3.58172 16.0027 8 16.0027C12.4183 16.0027 16 12.421 16 8.00275C16 3.58447 12.4183 0.00274658 8 0.00274658C3.58172 0.00274658 0 3.58447 0 8.00275ZM14 8.00275C14 11.3165 11.3137 14.0027 8 14.0027C4.68629 14.0027 2 11.3165 2 8.00275C2 4.68904 4.68629 2.00275 8 2.00275C11.3137 2.00275 14 4.68904 14 8.00275ZM9.69706 4.89148C10.0876 4.50095 10.7207 4.50095 11.1113 4.89148C11.5018 5.282 11.5018 5.91517 11.1113 6.30569L9.41421 8.00275L11.1113 9.6998C11.5018 10.0903 11.5018 10.7235 11.1113 11.114C10.7207 11.5045 10.0876 11.5045 9.69706 11.114L8 9.41696L6.30294 11.114C5.91242 11.5045 5.27925 11.5045 4.88873 11.114C4.49821 10.7235 4.49821 10.0903 4.88873 9.6998L6.58579 8.00275L4.88873 6.30569C4.49821 5.91517 4.49821 5.282 4.88873 4.89148C5.27925 4.50095 5.91242 4.50095 6.30294 4.89148L8 6.58853L9.69706 4.89148Z"
                fill={color}
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    );
};
