import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import isEqual from 'react-fast-compare';

import { Entity, LabelInfo, useAnnotationContext } from './ctx/ctx';
import { useSelectionListener } from './ctx/useSelectionListener';
import styles from './field.text-annotation.less';
import translations from './i18n/field.text-annotation.translations';
import { AnnotatedContent } from './ui/AnnotatedContent';
import { Labels } from './ui/Labels';
import { addSegments, cleanupSegment, EntityWithSegment } from './utils/annotatedSegmentInOutput';
import { serialize } from './utils/serialize';

type FieldImageAnnotationProps = FieldProps<EntityWithSegment[], Entity[]> & {
    content: string;
    labels: LabelInfo[];
    adjust?: 'words';
};

const type = 'field.text-annotation';

const noLabels: LabelInfo[] = [];

export const create = (core: Core) => {
    return {
        type,
        compile: core.helpers.field<FieldImageAnnotationProps>(
            type,
            observer(({ content = '', disabled = false, value = [], labels = noLabels, onChange, adjust }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);

                const ctx = useAnnotationContext(core, content, value, labels, disabled, adjust, t);

                React.useEffect(
                    () =>
                        reaction(
                            () => !isEqual(ctx.value, value),
                            () => onChange(ctx.value)
                        ),
                    [ctx, onChange, value]
                );

                React.useEffect(() => {
                    const newValue = value;

                    if (!isEqual(newValue, ctx.value)) {
                        runInAction(() => {
                            ctx.value = newValue;
                            ctx.activeLabel = null;
                            ctx.selection = null;
                        });
                    }
                }, [value, ctx]);

                const textContainerRef = React.useRef<HTMLDivElement>(null);

                useSelectionListener(ctx, textContainerRef);

                return (
                    <div className={styles.root}>
                        <AnnotatedContent containerRef={textContainerRef} ctx={ctx} />
                        <Labels core={core} ctx={ctx} />
                    </div>
                );
            }),
            {
                rawValue: {
                    serialize: (entities) => serialize(cleanupSegment(entities || [])),
                    parse: (entities, props) => addSegments(entities || [], props.content || ''),
                    validate: () => undefined
                },
                transformers: [core.fieldTransformers.emptyArrayTransformer]
            }
        )
    };
};

export { actionCreators, TextAnnotationHotkeyHandlers } from './ctx/useHotkeysIntegration';
export { translations };
