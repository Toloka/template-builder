import * as React from 'react';

import { makeIcon } from './makeIcon';

export const IconInput = makeIcon(
    <g>
        <path d="M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z" />
    </g>,
    'IconInput',
    {
        width: 12,
        height: 12,
        style: {
            transform: `rotate(-90deg)`
        }
    }
);
