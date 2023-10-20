import * as React from 'react';

import { makeIcon } from './makeIcon';

export const IconArrowDown = makeIcon(
    <g>
        <path d="M1.63 3L6 7.25 10.39 3l.63.6-5.01 4.86L1 3.61 1.63 3z"></path>
    </g>,
    'IconArrowDown',
    {
        width: 12,
        height: 12,
        viewBox: '0 0 12 12'
    }
);
