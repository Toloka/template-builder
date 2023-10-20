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

export const FolderOutlineIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
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
            aria-labelledby="icon Folder Outline"
        >
            <path
                d="M5.5 1.00275H1.5C0.671573 1.00275 0 1.67432 0 2.50275V12.5027C0 13.3312 0.671573 14.0027 1.5 14.0027H14.5C15.3284 14.0027 16 13.3312 16 12.5027V4.50275C16 3.67432 15.3284 3.00275 14.5 3.00275H8L7.1 1.80275C6.72229 1.29913 6.12951 1.00275 5.5 1.00275ZM2 12.0027V3.00275H5.5L6.4 4.20275C6.77771 4.70636 7.37049 5.00275 8 5.00275H14V12.0027H2Z"
                fill={color}
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    );
};
