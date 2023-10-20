import { anyMode, makeAction } from '../ctx/makeAction';
import { getCursorPosInImgSpace } from '../ctx/position';

export const moveVertexActions = [
    makeAction('drag', { target: 'vertex', mode: anyMode, vertexCursor: 'move' }, () => {
        let vertexId: string | undefined;

        return {
            start: ({ ctx, target }) => {
                if (target && target.type === 'vertex') {
                    vertexId = target.vertexId;

                    const vertex = ctx.value.vertices[vertexId];

                    ctx.value.shapes[vertex.shapeId].isEdited = true;
                }
            },
            move: ({ ctx, clientX, clientY }) => {
                if (!vertexId) {
                    return;
                }

                const { left, top } = getCursorPosInImgSpace(ctx.position, clientX, clientY);

                ctx.value.vertices[vertexId].onMove(left, top);
            },
            end: ({ ctx }) => {
                if (!vertexId) {
                    return;
                }

                const vertex = ctx.value.vertices[vertexId];

                ctx.value.shapes[vertex.shapeId].isEdited = false;
            },
            cursor: 'move'
        };
    })
];
