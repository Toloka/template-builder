import * as React from 'react';
import { PopperProps } from 'react-popper';

import { FieldConfig, FieldProps } from '../api/helpers/field';
import { ViewConfig, ViewProps } from '../api/helpers/view';
import { Hint } from '../api/ui/Hint/Hint';
import { Label } from '../api/ui/Label/Label';
import styles from './ViewLabel.less';

type ViewLabelProps = {
    hintPosition?: PopperProps<unknown>['placement'];
    viewProps: ViewProps<{}> | FieldProps<{}>;
    config: ViewConfig | FieldConfig;
};

export const ViewLabel: React.FC<ViewLabelProps> = React.memo(({ viewProps, config, hintPosition }) => {
    const showLabel = viewProps.label && config.options.showLabel;
    const showHint = viewProps.hint && config.options.showHintInLabel;

    if (showLabel || showHint) {
        return (
            <div className={styles.label} dir={viewProps.rtl?.mode}>
                {showHint ? (
                    <Hint
                        position={hintPosition}
                        hint={viewProps.hint!}
                        label={viewProps.label}
                        requiredMark={viewProps.requiredMark}
                    />
                ) : (
                    <Label requiredMark={viewProps.requiredMark} label={viewProps.label} />
                )}
            </div>
        );
    }

    return null;
});
ViewLabel.displayName = 'tb.ViewLabel';
