import { action } from 'mobx';

import { DataRW } from '../../data/rw';
import { ValueUsage } from '../../data/utils';
import { CtxBag } from '../ctxBag';
import { WritableForm } from '../tbCtx';
import { consistentReaction } from './consistentReaction';
import { TbNode } from './lifeCycleTypes';

type DataInfo = {
    form: WritableForm;
    path: string;
    default: unknown;
    data: DataRW<unknown>;
};

export const manageFieldValue = (node: TbNode) => {
    let oldInfo: DataInfo | undefined;
    let oldBag: CtxBag;
    let valueUsage: ValueUsage | null = null;

    const disposeInitial = consistentReaction(
        () => {
            if ('__tbField' in node.config) {
                return {
                    form: node.config.data.getForm(node.bag),
                    path: node.config.data.getPath(node.bag),
                    default: node.config.data.getDefault(node.bag),
                    data: node.config.data
                };
            } else {
                return undefined;
            }
        },
        action((newInfo) => {
            // nothing changed, skipping
            if (
                oldInfo === newInfo ||
                (oldInfo &&
                    newInfo &&
                    oldInfo.form === newInfo.form &&
                    oldInfo.path === newInfo.path &&
                    oldInfo.default === newInfo.default)
            ) {
                return;
            }
            // dispose old data
            if (valueUsage) {
                valueUsage.cancel();
            }
            valueUsage = null;
            if (oldInfo) {
                oldInfo.data.bury(oldBag, oldInfo.path);
            }
            // pull & subscribe to new data
            if (newInfo) {
                newInfo.data.resurrect(node.bag);
                const value = newInfo.data.get(node.bag);
                const touched = newInfo.data.getTouched(node.bag);

                if (typeof newInfo.default !== 'undefined' && typeof value === 'undefined' && !touched) {
                    newInfo.data.applyDefault(node.bag);
                }
                valueUsage = newInfo.data.setValueInUse(node.bag);
            }
            // update cache
            oldInfo = newInfo;
            oldBag = node.bag;
        }),
        `${node.key}-field-initial-value-manager`
    );

    const disposeFalse = consistentReaction(
        () => {
            if (
                '__tbField' in node.config &&
                (node.props as { preserveFalse?: boolean }).preserveFalse &&
                !node.config.options.ignorePreserveFalse
            ) {
                const form = node.config.data.getForm(node.bag);

                if (form === 'mounted') {
                    return;
                }

                return {
                    form,
                    path: node.config.data.getPath(node.bag),
                    value: node.config.data.get(node.bag),
                    data: node.config.data
                };
            } else {
                return undefined;
            }
        },
        action((fieldInfo) => {
            // nothing changed, skipping
            if (fieldInfo && typeof fieldInfo.value === 'undefined') {
                fieldInfo.data.set(false, fieldInfo.path, node.bag);
            }
        }),
        `${node.key}-field-false-value-manager`
    );

    return () => {
        disposeInitial();
        disposeFalse();
        if (valueUsage) {
            valueUsage.cancel();
        }
        valueUsage = null;
        if (oldInfo) {
            oldInfo.data.bury(oldBag, oldInfo.path);
        }
    };
};
