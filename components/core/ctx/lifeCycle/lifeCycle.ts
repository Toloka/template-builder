import { uniqueId } from '@toloka-tb/common/utils/uniqueId';
import { observable } from 'mobx';

import { Child } from '../../api/helpers/children';
import { DetailedCondition } from '../../api/helpers/condition';
import { makeTranslator } from '../../api/i18n';
import { resolveGetters } from '../../resolveGetters/resolveGetters';
import { CtxBag, makeComponentCtx, makeCtxBag } from '../ctxBag';
import { TbCtx } from '../tbCtx';
import { consistentReaction } from './consistentReaction';
import { TbNode } from './lifeCycleTypes';
import { makePropsGetter, noPropsGetter } from './makePropsGetter';
import { manageChildren } from './manageChildren';
import { manageFieldValue } from './manageFieldValue';
import { makeErrorsGetter, noErrorsGetter } from './resolveErrors';

const noop = () => undefined;

const makeNode = (config: TbNode['config'], rawBag: TbNode['bag']) => {
    const key = `${uniqueId('node')}-${config.props.type}`;
    let propsGetter = noPropsGetter; // assigned after the node is created
    let errorsGetter = noErrorsGetter;

    // this is a weird hack to deal with dynamic list
    rawBag.component.__tbViewKey = key;
    // watch bag individual ctx change for perf reasons (ctx themselves are observable already)
    const bag = observable(rawBag, undefined, { deep: false });

    const node: TbNode = observable<TbNode>(
        {
            // constants
            config,
            bag,
            key,

            // props
            get props() {
                return propsGetter.get();
            },
            children: {}, // controlled by a manager, reused

            // validation
            get validationError() {
                const conditionBag: CtxBag = {
                    ...node.bag,
                    conditionResolvingMode: 'detailed'
                };
                const resolvedCondition: DetailedCondition | undefined = resolveGetters(
                    node.config.props.validation,
                    conditionBag
                );

                let fieldError: TbNode['validationError'] | undefined;

                if ('__tbField' in node.config && node.config.validate) {
                    const t = makeTranslator(node.bag, node.config.props.type);
                    const parsedValue = resolveGetters(node.config.data, node.bag);
                    const props: any = node.props;
                    const errorMessage = node.config.validate(parsedValue, props.value, props, t);

                    if (errorMessage) {
                        fieldError = { message: errorMessage };
                    }
                }

                return resolvedCondition && !resolvedCondition.passed
                    ? resolvedCondition.errorGetter.direct()
                    : fieldError;
            },
            get errors() {
                return errorsGetter.get();
            },

            // destruction
            destroyed: false,
            destroy: noop
        },
        undefined,
        { deep: false }
    );

    bag.node = node;
    rawBag.tb.viewKey2NodeKey[node.config.__tbViewKey] = key;

    // children manager needs props so call order matters
    propsGetter = makePropsGetter(node);
    errorsGetter = makeErrorsGetter(node);

    // order matters here as manageFieldValue might alter value, that may be used by manageChildren (i.e. setting default value for field.list)
    const destroyFieldValueManager = manageFieldValue(node);
    const destroyChildManager = manageChildren(node, makeNode);

    node.destroy = () => {
        if (node.destroyed) {
            return;
        }

        destroyChildManager();
        destroyFieldValueManager();

        if (rawBag.tb.viewKey2NodeKey[node.config.__tbViewKey] === key) {
            delete rawBag.tb.viewKey2NodeKey[node.config.__tbViewKey];
        }
        delete node.bag.tb.rawNodeValue[node.key];
        delete node.bag.tb.viewState[node.key];

        node.destroyed = true;
    };

    return node;
};

const getRootArgs = (bareBag: CtxBag) => {
    const child = resolveGetters<Child>(bareBag.tb.config.view, bareBag);
    const bag = { ...bareBag, component: makeComponentCtx(child.config) };

    return { config: child.config, bag };
};

export const initLifeCycle = (tbCtx: TbCtx) => {
    const bareBag = makeCtxBag(tbCtx);

    let oldRootNodeDestroy: () => void = noop;

    const dispose = consistentReaction(
        () => getRootArgs(bareBag),
        ({ config, bag }) => {
            const newRoot = makeNode(config, bag);
            const destroyRoot = newRoot.destroy;

            newRoot.destroy = () => {
                destroyRoot();
                dispose();
            };
            tbCtx.tree = newRoot;

            oldRootNodeDestroy();

            oldRootNodeDestroy = destroyRoot;
        },
        uniqueId('tree')
    );
};
