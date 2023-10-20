import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import cx from 'classnames';
import * as React from 'react';
import isEqual from 'react-fast-compare';
import { ImageAnnotationEditor, Shape, Shapes } from 'toloka-img-annotation';

import styles from './field.bounding-box.less';

const type = 'field.bounding-box';

type FieldBoundingBoxProps = FieldProps<TbRectangle[]> & { image: string };
type TbRectangle = {
    shape: 'rectangle';
    top: number;
    left: number;
    width: number;
    height: number;
};

const tb2imageAnnotation = (box: TbRectangle): Shape => ({
    type: 'rectangle',
    data: {
        p1: {
            x: box.left,
            y: box.top
        },
        p2: {
            x: box.left + box.width,
            y: box.top + box.height
        }
    }
});

const imageAnnotation2tb = (shape: Shape): TbRectangle => {
    const x1 = shape.data.p1.x;
    const x2 = shape.data.p2.x;
    const y1 = shape.data.p1.y;
    const y2 = shape.data.p2.y;

    return {
        shape: 'rectangle',
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        width: Math.max(x1, x2) - Math.min(x1, x2),
        height: Math.max(y1, y2) - Math.min(y1, y2)
    };
};

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<FieldBoundingBoxProps>(type, ({ image, value, onChange, disabled }) => {
            const containerRef = React.useRef<HTMLDivElement>(null);
            const editorRef = React.useRef<ImageAnnotationEditor>();
            const imageRef = React.useRef<string>();

            React.useEffect(() => {
                const nextShapes = (value || []).map(tb2imageAnnotation);

                if (
                    !editorRef.current ||
                    !isEqual(editorRef.current.shapes, nextShapes) ||
                    imageRef.current !== image
                ) {
                    editorRef.current = new ImageAnnotationEditor(image, nextShapes);
                    imageRef.current = image;

                    if (containerRef.current) {
                        editorRef.current.render(containerRef.current);
                    }
                }
            }, [value, image]);

            // basically we re-subscribe on every render scince there is no telling if editor has changed and this is relatively cheap
            React.useEffect(() => {
                if (!editorRef.current) return;
                const update = (shapes: Shapes) => {
                    onChange(shapes.map(imageAnnotation2tb));
                };

                editorRef.current.on('shapes:update', update);

                return () => {
                    if (editorRef.current) {
                        editorRef.current.removeListener('shapes:update', update);
                    }
                };
            });

            return (
                <div ref={containerRef} className={cx(styles.editor, disabled && styles.editorDisabled)}>
                    Starting image annotation
                </div>
            );
        })
    };
};
