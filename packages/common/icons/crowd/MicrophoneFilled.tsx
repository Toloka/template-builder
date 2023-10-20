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

export const MicrophoneFilledIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
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
            aria-labelledby="icon Microphone Filled"
        >
            <path
                d="M11 3.00275C11 1.34589 9.65685 0.00274658 8 0.00274658C6.34315 0.00274658 5 1.34589 5 3.00275V8.00275C5 9.6596 6.34315 11.0027 8 11.0027C9.65685 11.0027 11 9.6596 11 8.00275V3.00275ZM2 8.00275C2 7.50569 2.40294 7.10275 2.9 7.10275C3.39706 7.10275 3.8 7.50569 3.8 8.00275C3.8 10.3223 5.6804 12.2027 8 12.2027C10.3196 12.2027 12.2 10.3223 12.2 8.00275C12.2 7.50569 12.6029 7.10275 13.1 7.10275C13.5971 7.10275 14 7.50569 14 8.00275C14 10.9769 11.836 13.4457 8.99665 13.9203C8.99887 13.9475 9 13.975 9 14.0027V15.0027C9 15.555 8.55228 16.0027 8 16.0027C7.44772 16.0027 7 15.555 7 15.0027V14.0027C7 13.975 7.00113 13.9475 7.00335 13.9203C4.16399 13.4457 2 10.9769 2 8.00275Z"
                fill={color}
                fillRule="evenodd"
                clipRule="evenodd"
            />
        </svg>
    );
};
