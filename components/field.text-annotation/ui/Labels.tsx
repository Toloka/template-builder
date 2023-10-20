import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { Core } from '@toloka-tb/core/coreComponentApi';
import { action } from '@toloka-tb/core/node_modules/mobx';
import { Button } from '@toloka-tb/common/components/Button';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { actionCreators } from '../ctx/useHotkeysIntegration';
import { rgbToHex } from '../utils/colors';
import { rangeInsideRange } from '../utils/rangeInsideRange';
import styles from './Labels.less';

const LabelIcon = makeIcon(
    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84l3.96-5.58c.25-.35.25-.81 0-1.16l-3.96-5.58z" />
);

type LabelsProps = { core: Core; ctx: AnnotationContext };
export const Labels = observer<LabelsProps>(({ ctx, core }) => {
    const { labels } = ctx;
    const { offset: selectionOffset, length: selectionLength } = ctx.selection! || { selectionOffset: -1, length: 0 };

    const hasSelectedEntities =
        ctx.selection !== null &&
        ctx.value.some((entity) =>
            rangeInsideRange(
                [selectionOffset, selectionOffset + selectionLength],
                [entity.offset, entity.offset + entity.length]
            )
        );

    return (
        <>
            <div className={styles.labels}>
                {labels.map(({ label: title, value: label, color }, index) => {
                    const highlighted =
                        ctx.activeLabel === label ||
                        ctx.value.some(
                            (entity) =>
                                entity.label === label &&
                                selectionOffset === entity.offset &&
                                selectionLength === entity.length
                        );

                    return (
                        <Button
                            key={index}
                            disabled={ctx.disabled}
                            checked={highlighted}
                            size={'s'}
                            view={'pseudo'}
                            className={styles.label}
                            onClick={action(() => {
                                if (ctx.selection) {
                                    ctx.actions.annotate(ctx, label);
                                } else {
                                    ctx.actions.toggleActiveLabel(ctx, label);
                                }
                            })}
                        >
                            <core.ui.ActionHint
                                dispatch={false}
                                action={actionCreators.annotate}
                                payload={index}
                                className={styles.actionHint}
                            />
                            <LabelIcon fill={rgbToHex(color)} className={styles.labelIcon} />
                            {title}
                        </Button>
                    );
                })}
                {hasSelectedEntities && !ctx.disabled && (
                    <Button
                        size={'s'}
                        view={'pseudo'}
                        className={styles.label}
                        disabled={ctx.disabled}
                        onClick={() => ctx.actions.removeAnnotation(ctx)}
                    >
                        <core.ui.ActionHint
                            dispatch={false}
                            action={actionCreators.remove}
                            className={styles.actionHint}
                        />
                        {ctx.t('clear')}
                    </Button>
                )}
            </div>
        </>
    );
});
