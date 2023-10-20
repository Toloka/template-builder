import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { nanoid } from 'nanoid';
import React from 'react';

export const UnknownDocumentIconDark = makeIcon(
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
                    stroke="#fff"
                    strokeWidth="1.33335"
                    strokeMiterlimit="79.8403"
                    strokeLinecap="round"
                    fill="transparent"
                />
                <defs>
                    <linearGradient
                        id={id}
                        x1="41.3311"
                        y1="72.0548"
                        x2="41.3311"
                        y2="-132"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset=".02" stopColor="#0064FF" />
                        <stop offset=".06" stopColor="#005FFF" stopOpacity=".86" />
                        <stop offset=".11" stopColor="#005BFF" stopOpacity=".72" />
                        <stop offset=".17" stopColor="#0057FF" stopOpacity=".59" />
                        <stop offset=".23" stopColor="#0053FF" stopOpacity=".48" />
                        <stop offset=".3" stopColor="#0051FF" stopOpacity=".4" />
                        <stop offset=".38" stopColor="#004FFF" stopOpacity=".33" />
                        <stop offset=".48" stopColor="#004DFF" stopOpacity=".28" />
                        <stop offset=".61" stopColor="#004CFF" stopOpacity=".26" />
                        <stop offset="1" stopColor="#004CFF" stopOpacity=".25" />
                    </linearGradient>
                </defs>
            </>
        );
    },
    'UnknownDocumentIconDark',
    {
        width: 80,
        height: 80,
        viewBox: '0 0 80 80'
    }
);
