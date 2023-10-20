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

export const InfoFilledIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
    const size = exactSize || sizes[shortSize || 'm'] || 16;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={style}
            {...restProps}
            role="img"
            focusable="false"
            aria-labelledby="icon Info Filled"
        >
            <path
                d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11.304 18.466C11.934 18.466 12.636 18.178 13.5 17.008L14.4113 15.7881C14.4129 15.7859 14.4145 15.7837 14.416 15.7815C14.5228 15.6311 14.4874 15.4227 14.337 15.316C14.1785 15.2035 13.9605 15.229 13.8322 15.3751L12.357 17.0548C12.2874 17.134 12.1744 17.1588 12.078 17.116C11.9843 17.0744 11.9341 16.9715 11.9589 16.872L13.8163 9.42625C13.8336 9.35723 13.8359 9.28532 13.8231 9.21534C13.7734 8.9437 13.513 8.76373 13.2413 8.81337L9.89086 9.42564C9.75627 9.45023 9.64836 9.55099 9.6146 9.68357L9.52937 10.0183C9.52423 10.0385 9.52164 10.0592 9.52164 10.08C9.52164 10.2181 9.63356 10.33 9.77164 10.33H11.502L10.026 16.252C9.972 16.486 9.882 16.882 9.882 17.17C9.882 17.836 10.278 18.466 11.304 18.466ZM13.134 7.93C13.836 7.93 14.376 7.516 14.52 6.886C14.556 6.742 14.574 6.58 14.574 6.472C14.574 5.968 14.178 5.5 13.44 5.5C12.738 5.5 12.198 5.914 12.054 6.544C12.018 6.688 12 6.85 12 6.958C12 7.462 12.396 7.93 13.134 7.93Z"
                fill={color}
            />
        </svg>
    );
};
