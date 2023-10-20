import React from 'react';

import { makeIcon } from './makeIcon';

export const DesktopIcon = makeIcon(
    <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9.333a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2Zm2 1.051a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7.231a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7.23ZM1 14a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H1Z"
        fill="inherit"
    />,
    'DesktopIcon',
    {
        width: '16',
        height: '16',
        viewBox: '0 0 16 16',
        fill: '#000'
    }
);
