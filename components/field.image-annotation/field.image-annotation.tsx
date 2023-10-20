import { Core, FieldProps } from '@toloka-tb/core/coreComponentApi';
import { create as createMediaComponents, MediaLayoutProps } from '@toloka-tb/lib.media-view';
import cx from 'classnames';
import { Spin } from '@toloka-tb/common/components/Spin';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import isEqual from 'react-fast-compare';

import { ShapeSetupMap, useAnnotationContext } from './ctx/ctx';
import { LabelInfo } from './ctx/selection';
import { ShapeValue } from './ctx/value';
import styles from './field.image-annotation.less';
import translations from './i18n/field.image-annotation.translations';
import { pointSetup } from './shapes/Point';
import { polygonSetup } from './shapes/Polygon';
import { rectangleSetup } from './shapes/Rectangle';
import { Controls } from './ui/Controls';
import { Guidelines } from './ui/Guidelines';
import { Image } from './ui/Image';
import { AnnotationMenu } from './ui/Menu';
import { Shapes } from './ui/Shapes';
import { Vertices } from './ui/Vertex';

type FieldImageAnnotationProps = FieldProps<ShapeValue[], ShapeValue[], keyof typeof translations.ru> & {
    image: string;
    labels?: LabelInfo[];
    shapes?: {
        point?: boolean;
        rectangle?: boolean;
        polygon?: boolean;
    };
} & MediaLayoutProps;

const type = 'field.image-annotation';
const defaultShapes = { point: true, rectangle: true, polygon: true };

const shape2setup: ShapeSetupMap = {
    point: pointSetup,
    rectangle: rectangleSetup,
    polygon: polygonSetup
};

const noLabels: LabelInfo[] = [];

export { translations };

export const create = (core: Core) => {
    const { MediaError, MediaLayout } = createMediaComponents(core);

    return {
        type,
        compile: core.helpers.field<FieldImageAnnotationProps>(
            type,
            observer(({ image, disabled, shapes = defaultShapes, value, labels, onChange, ...mediaLayout }) => {
                const t = core.i18n.useTranslation<keyof typeof translations.ru>(type);
                const shapeSetupMap = React.useMemo(() => {
                    const setups: ShapeSetupMap = {};

                    for (const [shape, shoudUse] of Object.entries(shapes)) {
                        if (shoudUse) {
                            setups[shape] = shape2setup[shape];
                        }
                    }

                    return setups;
                }, [shapes]);

                const svgRef = React.useRef<SVGSVGElement>(null);
                const { ctx, resizeObserverRef } = useAnnotationContext(
                    core,
                    svgRef,
                    image,
                    shapeSetupMap,
                    labels || noLabels,
                    disabled || false,
                    t
                );

                React.useEffect(
                    () =>
                        reaction(
                            () => ctx.value.exportValue,
                            (nextValue) => onChange(nextValue.length > 0 ? nextValue : undefined)
                        ),
                    [ctx, onChange]
                );

                React.useEffect(() => {
                    const newValue = value || [];

                    if (!isEqual(newValue, ctx.value.exportValue)) {
                        ctx.selection.selectedShapeId = undefined;
                        ctx.selection.selectedVertexId = undefined;
                        ctx.actions.cancelMode(ctx);
                        ctx.value.exportValue = newValue;
                    }
                }, [value, ctx]);

                React.useEffect(() => {
                    if (ctx.disabled) {
                        // force disabled if componets get disable (like after pager)
                        ctx.actions.toggleMode(ctx, 'select');
                    } else if (ctx.value.exportValue.length === 0 && ctx.actions.mode === 'select') {
                        // force shape creation mode if there are no shapes as select is useless without them
                        const firstShape = Object.keys(ctx.shapeSetupMap)[0];

                        ctx.actions.toggleMode(ctx, firstShape || 'select');
                    }
                }, [ctx]);

                return (
                    <div className={cx(styles.root, mediaLayout.fullHeight && styles.rootFullHeight)}>
                        <Controls core={core} ctx={ctx} />
                        <div className={styles.contentSection}>
                            <MediaLayout {...mediaLayout} ref={resizeObserverRef}>
                                <MediaError url={image} error={ctx.position.image.loadingError} />
                                {ctx.position.image.isLoading && (
                                    <div className={styles.loading}>
                                        <Spin />
                                    </div>
                                )}
                                <svg
                                    viewBox={`0 0 ${ctx.position.canvas.width} ${ctx.position.canvas.height}`}
                                    className={cx(styles.canvas)}
                                    ref={svgRef}
                                    style={{ cursor: ctx.actions.canvasCursor }}
                                >
                                    {ctx.position.image.isLoading || (
                                        <>
                                            <Image ctx={ctx} />
                                            <Shapes ctx={ctx} />
                                            <Guidelines ctx={ctx} />
                                            <Vertices ctx={ctx} />
                                        </>
                                    )}
                                </svg>
                            </MediaLayout>
                            <AnnotationMenu core={core} ctx={ctx} />
                        </div>
                    </div>
                );
            }),
            {
                rawValue: {
                    parse: (x) => x,
                    serialize: (x) => x,
                    validate: (value, _, props, t) => {
                        if (props.labels && Array.isArray(value) && value.some((x) => x.label === undefined)) {
                            return t('requiredLabel');
                        }
                    }
                }
            }
        )
    };
};

export { actionCreators, ImageAnnotationHotkeyHandlers } from './ctx/hotkeysIntegration';
