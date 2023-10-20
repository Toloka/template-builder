import 'microtip/microtip.css';

import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { Core } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { actionCreators } from '../ctx/hotkeysIntegration';
import { DeleteAll } from '../features/deleteAll';
import { Reset, ZoomIn, ZoomOut } from '../features/panZoom';
import { Default } from '../features/select';
import styles from './Controls.less';

type ActionCreators = typeof actionCreators;

export const Control: React.FC<{
    checked: boolean;
    onClick: () => void;
    Icon: ReturnType<typeof makeIcon>;
    tooltip: string;
    action?: ActionCreators[keyof ActionCreators];
    payload?: any;
    core?: Core;
}> = ({ Icon, checked, onClick, tooltip, core, action, payload }) => {
    const btnRef = React.useRef<HTMLButtonElement>(null);

    return (
        <button
            className={cx(styles.control, checked && styles.controlChecked)}
            onClick={() => {
                onClick();
                if (btnRef.current) {
                    btnRef.current.blur(); // removing microtip tooltip after interaction
                }
            }}
            aria-label={tooltip}
            data-microtip-position="right"
            data-microtip-size="medium"
            role="tooltip"
            type="button"
            ref={btnRef}
        >
            {action && core && (
                <core.ui.ActionHint
                    dispatch={false}
                    action={action}
                    payload={payload}
                    className={styles.controlActionHint}
                />
            )}
            <Icon className={cx(styles.controlIcon, checked && styles.controlCheckedIcon)} />
        </button>
    );
};

export const ControlGroup: React.FC = ({ children }) => <div className={styles.controlsGroup}>{children}</div>;

export const Controls: React.FC<{ core: Core; ctx: AnnotationContext }> = ({ core, ctx }) => {
    const shapeControls = Object.entries(ctx.shapeSetupMap).map(([shape, setup]) => (
        <setup.control ctx={ctx} core={core} key={shape} />
    ));

    return (
        <div className={styles.controls}>
            <ControlGroup>
                <ZoomIn ctx={ctx} />
                <ZoomOut ctx={ctx} />
                <Reset ctx={ctx} />
            </ControlGroup>
            <ControlGroup>
                <Default core={core} ctx={ctx} />
            </ControlGroup>
            {shapeControls.length > 0 && !ctx.disabled && (
                <>
                    <ControlGroup>{shapeControls}</ControlGroup>
                    <ControlGroup>
                        <DeleteAll ctx={ctx} />
                    </ControlGroup>
                </>
            )}
        </div>
    );
};
