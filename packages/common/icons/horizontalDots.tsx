import * as React from 'react';

import { makeIcon } from './makeIcon';

export const IconHorizontalDots = makeIcon(
    <g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1 8.003a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm5.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm7-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"
        ></path>
    </g>,
    'IconHorizontalDots',
    {
        width: 16,
        height: 16,
        viewBox: '0 0 16 16'
    }
);
