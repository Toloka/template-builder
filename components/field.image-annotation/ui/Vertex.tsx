import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { left2x, top2y } from '../ctx/position';
import styles from './Vertex.less';

const baseRadius = 3;
const haloRadius = 12;

export const Halo: React.FC<{
    x: number;
    y: number;
    color: string;
    vertexId: string;
    shapeId: string;
    cursor: string;
}> = ({ x, y, color, vertexId, shapeId, cursor }) => {
    return (
        <circle
            cx={x}
            cy={y}
            r={haloRadius}
            fill={color}
            stroke={color}
            style={{ cursor }}
            className={cx(styles.halo)}
            data-annotation-vertex-id={vertexId}
            data-annotation-shape-id={shapeId}
        />
    );
};

export const VertexView: React.FC<{
    vertexId: string;
    ctx: AnnotationContext;
}> = observer((props) => {
    const vertex = props.ctx.value.vertices[props.vertexId];

    if (!vertex) {
        return null;
    }

    const x = left2x(props.ctx.position, vertex.left);
    const y = top2y(props.ctx.position, vertex.top);

    const color = props.ctx.selection.getColor(props.ctx, vertex.shapeId);

    const isSelected = props.ctx.selection.selectedVertexId === props.vertexId;
    const isSelectable = props.ctx.actions.mode === 'select';

    if (x + baseRadius < 0 || y + baseRadius < 0) {
        return null;
    }

    return (
        <g
            className={cx(
                styles.vertex,
                styles.vertexEditable,
                isSelected && styles.vertexSelected,
                isSelectable && styles.vertexSelectable
            )}
        >
            <Halo
                x={x}
                y={y}
                vertexId={props.vertexId}
                color={color}
                shapeId={vertex.shapeId}
                cursor={props.ctx.actions.vertexCursor}
            />

            <circle
                cx={x}
                cy={y}
                r={baseRadius}
                stroke={color}
                style={{ cursor: props.ctx.actions.vertexCursor }}
                className={styles.core}
                data-annotation-vertex-id={props.vertexId}
                data-annotation-shape-id={vertex.shapeId}
            />
        </g>
    );
});

export const Vertices: React.FC<{
    ctx: AnnotationContext;
}> = observer((props) => (
    <>
        {Object.keys(props.ctx.value.vertices).map((vertexId) => (
            <VertexView ctx={props.ctx} vertexId={vertexId} key={vertexId} />
        ))}
    </>
));
