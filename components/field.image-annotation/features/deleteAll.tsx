import { makeIcon } from '@toloka-tb/common/icons/makeIcon';
import { action } from 'mobx';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';
import { Control } from '../ui/Controls';

const DeleteAllIcon = makeIcon(
    <path d="M16 16h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1s.45-1 1-1zm0-8h5c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1s.45-1 1-1zm0 4h4c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1s.45-1 1-1zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM13 5h-2l-.71-.71c-.18-.18-.44-.29-.7-.29H6.41c-.26 0-.52.11-.7.29L5 5H3c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1z" />
);

export const DeleteAll: React.FC<{ ctx: AnnotationContext }> = (props) => (
    <Control
        Icon={DeleteAllIcon}
        checked={false}
        onClick={action(() => {
            // eslint-disable-next-line no-alert
            const doDelete = confirm(props.ctx.t('featureDeleteAllConfirm'));

            if (doDelete) {
                props.ctx.selection.selectedShapeId = undefined;
                props.ctx.selection.selectedVertexId = undefined;
                props.ctx.actions.cancelMode(props.ctx);
                props.ctx.value.exportValue = [];
            }
        })}
        tooltip={props.ctx.t('featureDeleteAllTooltip')}
    />
);
