import { Child } from '../../api/helpers/children';
import { makeComponentCtx } from '../ctxBag';
import { consistentReaction } from './consistentReaction';
import { MakeNode, TbNode } from './lifeCycleTypes';

type NormalChildren = { [key: string]: Child };

const getNormalizedChildren = (node: TbNode) => node.config.children(node.props, node.bag);

const updateChildren = (newChildren: NormalChildren, node: TbNode, makeNode: MakeNode) => {
    const keys = new Set([...Object.keys(newChildren), ...Object.keys(node.children)]);

    const updatedChildren: TbNode['children'] = { ...node.children };

    for (const key of keys) {
        const oldChild = updatedChildren[key];
        const newChild = newChildren[key];

        // deleted
        if (!newChild || !newChild.config) {
            if (oldChild) {
                oldChild.destroy();
                delete updatedChildren[key];
            }
            // added
        } else if (!oldChild) {
            if (newChild && newChild.config) {
                const newNode = makeNode(newChild.config, {
                    ...newChild.bag,
                    component: makeComponentCtx(newChild.config)
                });

                updatedChildren[key] = newNode;
            }
        } else {
            if (newChild.config !== oldChild.config) {
                oldChild.destroy();

                const newNode = makeNode(newChild.config, {
                    ...newChild.bag,
                    component: makeComponentCtx(newChild.config)
                });

                updatedChildren[key] = newNode;
            }

            if (newChild.bag.data !== oldChild.bag.data) {
                oldChild.bag.data = newChild.bag.data;
            }
        }
    }

    node.children = updatedChildren;
};

export const manageChildren = (node: TbNode, makeNode: MakeNode) => {
    const destroy = (node: TbNode) => Object.values(node.children).forEach((child) => child.destroy());

    const dispose = consistentReaction(
        () => getNormalizedChildren(node),
        (children) => updateChildren(children, node, makeNode),
        `${node.key}-child-manager`
    );

    return () => {
        dispose();
        destroy(node);
    };
};
