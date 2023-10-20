import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { create, finish } from '../shapes/Rectangle';
import styles from './Guidelines.less';

export const Guidelines: React.FC<{ ctx: AnnotationContext }> = observer(({ ctx }) => {
    const x = ctx.position.cursor.x;
    const y = ctx.position.cursor.y;
    const color = ctx.selection.getColor(ctx);

    return (
        <g>
            <line
                className={cx(styles.guideline)}
                x1={x.toString()}
                y1="0"
                x2={x.toString()}
                y2="100%"
                stroke={color}
                visibility={ctx.actions.mode === create || ctx.actions.mode === finish ? 'visible' : 'hidden'}
            />
            <line
                className={cx(styles.guideline)}
                x1="0"
                y1={y.toString()}
                x2="100%"
                y2={y.toString()}
                stroke={color}
                visibility={ctx.actions.mode === create || ctx.actions.mode === finish ? 'visible' : 'hidden'}
            />
        </g>
    );
});
