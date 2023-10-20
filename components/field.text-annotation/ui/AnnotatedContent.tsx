import { useObserver } from '@toloka-tb/core/node_modules/mobx-react-lite';
import cx from 'classnames';
import { reaction, toJS } from 'mobx';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { Color, getTextColorByBackground, rgbToHex, unknownColor } from '../utils/colors';
import styles from './AnnotatedContent.less';

export const AnnotatedContent: React.FC<{ ctx: AnnotationContext; containerRef: React.RefObject<HTMLDivElement> }> = ({
    ctx,
    containerRef
}) => {
    const entities = useObserver(() => ctx.value);
    const labels = useObserver(() => ctx.labels);
    const content = useObserver(() => ctx.content);
    const sortedEntities = toJS(entities).sort((a, b) => a.offset - b.offset);

    const entityNodesRefs = React.useRef<{ [entityId: string]: React.RefObject<HTMLSpanElement> }>({});
    const mouseDownRef = React.useRef<{ timeStamp: number; x: number; y: number } | null>(null);

    React.useEffect(() => {
        if (ctx.disabled) return;

        const dispose = reaction(
            () => ctx.selection?.trigger === 'click',
            () => {
                if (!ctx.selection) return;

                const nodeRef = entityNodesRefs.current[`${ctx.selection.offset}_${ctx.selection.length}`];
                const node = nodeRef?.current;
                const selection = window.getSelection();

                if (!node || !selection) return;

                selection.empty();
                selection.setBaseAndExtent(node, 0, node, 1);
            }
        );

        return () => dispose();
    }, [ctx, ctx.disabled]);

    const annotatedContent: React.ReactNode[] = [];
    const colors: { [entityName: string]: Color } = labels.reduce(
        (acc, label) => ({ ...acc, [label.value]: label.color }),
        {}
    );
    const titles: { [entityName: string]: string } = labels.reduce(
        (acc, label) => ({ ...acc, [label.value]: label.label }),
        {}
    );

    let lastAddedChar = 0;

    for (let i = 0; i < sortedEntities.length; i++) {
        const entity = sortedEntities[i];

        if (lastAddedChar < entity.offset) {
            const textContent = content.slice(lastAddedChar, entity.offset);
            const key = `${entity.offset}_0`;

            lastAddedChar = entity.offset;

            annotatedContent.push(<span key={key}>{textContent}</span>);
        }

        const textContent = content.slice(entity.offset, entity.offset + entity.length);
        const key = `${entity.offset}_${entity.length}`;
        const backgroundColor = colors[entity.label] || unknownColor;
        const inlineStyles: React.CSSProperties = {
            backgroundColor: rgbToHex(backgroundColor),
            color: getTextColorByBackground(backgroundColor)
        };

        lastAddedChar = entity.offset + entity.length;

        if (!entityNodesRefs.current[key]) {
            entityNodesRefs.current[key] = { current: null };
        }

        annotatedContent.push(
            <span
                key={key}
                style={inlineStyles}
                ref={entityNodesRefs.current[key]}
                title={titles[entity.label]}
                className={cx(!ctx.disabled && styles.activeToken)}
                onMouseDown={(event) =>
                    (mouseDownRef.current = { timeStamp: Date.now(), x: event.pageX, y: event.pageY })
                }
                onMouseUp={(event) => {
                    // using mousedown&mouseup combination to
                    // check either user really clicked element or
                    // user just selected a range insde of the <span />
                    if (!mouseDownRef.current) return;
                    if (
                        Date.now() - mouseDownRef.current.timeStamp > 1000 ||
                        Math.abs(event.pageX - mouseDownRef.current.x) > 2 ||
                        Math.abs(event.pageY - mouseDownRef.current.y) > 2
                    ) {
                        return;
                    }

                    ctx.selection = {
                        offset: entity.offset,
                        length: entity.length,
                        trigger: 'click'
                    };
                }}
            >
                {textContent}
            </span>
        );
    }

    if (lastAddedChar < content.length) {
        const textContent = content.slice(lastAddedChar);
        const key = `end_${lastAddedChar}_${content.length}_unlabeled`;

        lastAddedChar = content.length;

        annotatedContent.push(<span key={key}>{textContent}</span>);
    }

    return (
        <div className={styles.container} ref={containerRef}>
            {annotatedContent}
        </div>
    );
};
