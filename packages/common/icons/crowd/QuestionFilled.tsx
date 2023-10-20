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

export const QuestionFilledIcon: React.FC<Props> = ({ size: shortSize, exactSize, color, ...restProps }) => {
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
            aria-labelledby="icon Question Filled"
        >
            <path
                d="M14 8C14 9.5913 13.3679 11.1174 12.2426 12.2426C11.1174 13.3679 9.5913 14 8 14C6.4087 14 4.88258 13.3679 3.75736 12.2426C2.63214 11.1174 2 9.5913 2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.5913 2 11.1174 2.63214 12.2426 3.75736C13.3679 4.88258 14 6.4087 14 8V8ZM7.272 9.654H8.517C8.51 9.277 8.541 9.014 8.61 8.868C8.681 8.722 8.862 8.528 9.152 8.288C9.712 7.822 10.076 7.454 10.246 7.184C10.4139 6.92856 10.5036 6.62967 10.504 6.324C10.504 5.777 10.272 5.299 9.806 4.889C9.341 4.475 8.714 4.269 7.926 4.269C7.177 4.269 6.572 4.472 6.11 4.879C5.65 5.286 5.403 5.781 5.368 6.363L6.628 6.52C6.715 6.113 6.876 5.81 7.111 5.611C7.345 5.413 7.636 5.313 7.985 5.313C8.346 5.313 8.633 5.41 8.845 5.602C9.0201 5.74656 9.13247 5.95326 9.15856 6.17882C9.18466 6.40437 9.12246 6.63128 8.985 6.812C8.908 6.913 8.668 7.127 8.268 7.452C7.868 7.778 7.601 8.071 7.468 8.332C7.334 8.592 7.267 8.923 7.267 9.327L7.272 9.654V9.654ZM7.272 10.128V11.5H8.644V10.128H7.272Z"
                fill={color}
                fillRule="evenodd"
                clipRule="evenodd"
                fillOpacity="0.5"
            />
        </svg>
    );
};
