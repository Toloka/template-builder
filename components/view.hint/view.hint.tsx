import { Core } from '@toloka-tb/core/coreComponentApi';
import React from 'react';

type Props = {
    hint: string;
    label?: string;
};

const type = 'view.hint';

export const create = (core: Core) => {
    const { Hint } = core.ui;

    return {
        type,
        compile: core.helpers.view<Props>(type, ({ label, hint }) => <Hint hint={hint} label={label} />, {
            showLabel: false,
            showHintInLabel: false
        })
    };
};
