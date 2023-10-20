import { ComponentPath } from '../ast/astUtils';

type GenericCase = {
    predicate: (componentPath: ComponentPath) => boolean;
    updatePath: (path: ComponentPath['path']) => ComponentPath['path'];
};

type GenericHandler = {
    type: string;
    cases: GenericCase[];
};

const generics: GenericHandler[] = [
    {
        type: 'helper.if',
        cases: [
            {
                predicate: ({ path, kind }) => path[0] === 'then' && !(path.length === 1 && kind === 'key'),
                updatePath: (path) => path.slice(1)
            },
            {
                predicate: ({ path, kind }) => path[0] === 'else' && !(path.length === 1 && kind === 'key'),
                updatePath: (path) => path.slice(1)
            }
        ]
    },
    {
        type: 'helper.switch',
        cases: [
            {
                predicate: ({ path, kind }) => path[0] === 'default' && !(path.length === 1 && kind === 'key'),
                updatePath: (path) => path.slice(1)
            },
            {
                predicate: ({ path, kind }) =>
                    path[0] === 'cases' && path[2] === 'result' && !(path.length === 3 && kind === 'key'),
                updatePath: (path) => path.slice(3)
            }
        ]
    },
    {
        type: 'helper.transform',
        cases: [
            {
                predicate: ({ path, kind }) => path[0] === 'into' && !(path.length === 1 && kind === 'key'),
                updatePath: (path) => [0, ...path.slice(1)] // pretty much replace into with 0
            }
        ]
    }
];

const adjustForGenerics = (componentPath: ComponentPath): ComponentPath => {
    for (const generic of generics) {
        // eslint-disable-next-line no-continue
        if (generic.type !== componentPath.type) continue;

        for (const situation of generic.cases) {
            if (situation.predicate(componentPath)) {
                const parent = componentPath.parents[componentPath.parents.length - 1];
                const meaningfulPath = situation.updatePath(componentPath.path);

                return {
                    kind: componentPath.kind,
                    tail: componentPath.tail,

                    node: parent.node,
                    type: parent.type,
                    path: parent.path.concat(meaningfulPath),

                    parents: componentPath.parents.slice(0, -1),
                    globalPath: componentPath.globalPath.slice(0, -componentPath.path.length).concat(meaningfulPath),

                    readableContext: parent.readableContext,
                    writableContext: parent.writableContext,
                    conditionDefaultDataContext: parent.conditionDefaultDataContext
                };
            }
        }
    }

    return componentPath;
};

export const adjustForGenericsRecursevely = (componentPath: ComponentPath): ComponentPath => {
    const adjustedPath = adjustForGenerics(componentPath);
    const wasAdjusted = adjustedPath !== componentPath;

    if (wasAdjusted) {
        return adjustForGenericsRecursevely(adjustedPath);
    }

    return adjustedPath;
};
