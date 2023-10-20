import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { AnnotationContext } from '../ctx/ctx';

export const Shapes: React.FC<{
    ctx: AnnotationContext;
}> = observer((props) => (
    <>
        {Object.keys(props.ctx.value.shapes).map((shapeId) => {
            const Component = props.ctx.shapeSetupMap[props.ctx.value.shapes[shapeId].shape].component;

            return <Component ctx={props.ctx} shapeId={shapeId} key={shapeId} />;
        })}
    </>
));
