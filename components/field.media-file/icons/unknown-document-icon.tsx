import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { nanoid } from 'nanoid';
import React from 'react';

export const UnknownDocumentIcon = makeIcon(
    () => {
        const id = nanoid();

        return (
            <>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M65.338 73.3396H17.3336c-1.4685 0-2.6632-1.1947-2.6632-2.6631V7.99474c0-1.46847 1.1947-2.66314 2.6632-2.66314h36.0042c2.2667 0 4.3805.57956 6.041 2.03913l6.6454 6.64367c1.3547 1.5253 1.9805 3.6089 1.9805 5.9841l-.0036 50.678c0 1.4684-1.1947 2.6631-2.6631 2.6631Z"
                    fill={`url(#${id})`}
                />
                <path
                    d="M66.0255 19.3389h-9.3584c-1.4685 0-2.6632-1.1947-2.6632-2.6632V7.30849"
                    stroke="#0055D9"
                    strokeWidth="1.33335"
                    strokeMiterlimit="79.8403"
                    fill="transparent"
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient
                        id={id}
                        x1="55.1919"
                        y1="73.0153"
                        x2="55.1919"
                        y2="5.33052"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#A1BFFF" stopOpacity=".17" />
                        <stop offset="1" stopColor="#679BFF" stopOpacity=".92" />
                    </linearGradient>
                </defs>
            </>
        );
    },
    'UnknownDocumentIcon',
    {
        width: 80,
        height: 80,
        viewBox: '0 0 80 80'
    }
);
