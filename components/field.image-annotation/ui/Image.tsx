import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { left2x, top2y } from '../ctx/position';
import styles from './Image.less';

export const Image: React.FC<{ ctx: AnnotationContext }> = observer(({ ctx }) => {
    const w = ctx.position.image.width;
    const h = ctx.position.image.height;
    const zoom = ctx.position.zoom;

    return (
        <image
            x={left2x(ctx.position, 0)}
            y={top2y(ctx.position, 0)}
            href={ctx.position.image.url}
            width={w * zoom}
            height={h * zoom}
            className={styles.image}
        />
    );
});
