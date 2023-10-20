import { ComponentPath } from '../ast/astUtils';

export const replaceWithParent = (componentPath: ComponentPath): ComponentPath => {
    const parent = componentPath.parents[componentPath.parents.length - 1];

    return {
        kind: componentPath.kind,
        tail: componentPath.tail,

        node: parent.node,
        type: parent.type,
        path: parent.path,

        parents: componentPath.parents.slice(0, -1),
        globalPath: componentPath.globalPath.slice(0, -componentPath.path.length),

        readableContext: parent.readableContext,
        writableContext: parent.writableContext,
        conditionDefaultDataContext: parent.conditionDefaultDataContext
    };
};
