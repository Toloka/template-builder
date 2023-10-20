import * as React from 'react';

import { makeIcon } from './makeIcon';

export const IconShare = makeIcon(
    <g>
        <path
            d="M14 8h2v8H0V8h2v6h12V8zM8 0l4 5H9v6H7V5H4l4-5z"
            stroke="none"
            strokeWidth="1"
            fillRule="evenodd"
        ></path>
    </g>,
    'IconShare',
    {
        width: 12,
        height: 12,
        viewBox: '0 0 16 16'
    }
);
