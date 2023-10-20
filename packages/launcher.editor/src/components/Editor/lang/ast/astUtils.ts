import { KeyNode, MissingNode, ObjectNode, PropertyNode, ValueNode } from '@toloka-tb/lang.json';

import { getArchetype } from '../utils/getArchetype';

export type Path = Array<string | number>;

export type ComponentNode = {
    type: string;
    path: Path;
    node: ObjectNode;

    // Context
    readableContext: boolean;
    writableContext: boolean;
    conditionDefaultDataContext: boolean;
};

export type ComponentPath = ComponentNode & {
    // ast position info
    kind: 'value' | 'key';
    tail: ValueNode | KeyNode | MissingNode;

    // Parents
    globalPath: Path;
    parents: ComponentNode[];
};

const writableContextProviders: { [type: string]: { [prop: string]: true } } = {
    'field.list': {
        render: true
    }
};
const readableContextProviders: { [type: string]: { [prop: string]: true } } = {
    'field.list': {
        render: true
    },
    'helper.transform': {
        into: true
    },
    'plugin.trigger': {
        action: true,
        condition: true
    },
    'plugin.toloka': {
        notifications: true
    }
};
const conditionDefaultDataProviders: { [type: string]: { [prop: string]: true } } = {
    'plugin.trigger': {
        condition: true
    }
};

const hasConditionDefaultDataProvider = (type: string, path: string | number) =>
    (getArchetype(type) === 'field' && path === 'validation') ||
    Boolean(conditionDefaultDataProviders[type] && conditionDefaultDataProviders[type][path]);

export const getComponentPath = (ast: ValueNode | MissingNode, offset: number): ComponentPath => {
    let type: ComponentPath['type'] = 'root';
    let path: ComponentPath['path'] = [];
    let componentNode: ComponentPath['node'] = ast as ObjectNode;

    let kind: ComponentPath['kind'] = 'value';
    let tail: ComponentPath['tail'] = ast;

    let readableContext = false;
    let writableContext = false;
    let conditionDefaultDataContext = false;

    const parents: ComponentNode[] = [];
    const globalPath: Path = [];

    const advance = (node: ValueNode) => {
        tail = node;
        if (node.type === 'object') {
            let targetProp: PropertyNode | undefined;
            let newType: string | undefined;

            for (const prop of node.props) {
                if (prop.key.type === 'key') {
                    if (prop.key.value === 'type') {
                        newType = prop.value.type === 'string' && prop.value.value ? prop.value.value : 'invalid';
                    } else if (prop.key.value === '$ref') {
                        newType = '$ref';
                    } else if (prop.key.value === '$empty') {
                        newType = '$empty';
                    }
                }

                if (prop.from <= offset && offset <= prop.to) {
                    targetProp = prop;
                }
            }

            // we found new type, updating results
            if (newType) {
                readableContext =
                    readableContext || (type in readableContextProviders && path[0] in readableContextProviders[type]);
                writableContext =
                    writableContext || (type in writableContextProviders && path[0] in writableContextProviders[type]);

                conditionDefaultDataContext =
                    conditionDefaultDataContext || hasConditionDefaultDataProvider(type, path[0]);

                parents.push({
                    type,
                    path,
                    node: componentNode,

                    readableContext,
                    writableContext,
                    conditionDefaultDataContext
                });

                componentNode = node;
                type = newType;
                path = [];
            }

            if (targetProp) {
                path.push(targetProp.key.type === 'key' ? targetProp.key.value : '');
                globalPath.push(targetProp.key.type === 'key' ? targetProp.key.value : '');

                if (targetProp.key.from <= offset && offset <= targetProp.key.to) {
                    kind = 'key';
                    tail = targetProp.key;
                } else {
                    kind = 'value';
                    tail = targetProp.value;
                    if (targetProp.value.type !== 'missing') {
                        advance(targetProp.value);
                    }
                }
            } else {
                return;
            }
        }

        if (node.type === 'array') {
            for (let i = 0; i < node.items.length; ++i) {
                if (node.items[i].from <= offset && offset <= node.items[i].to) {
                    path.push(i);
                    globalPath.push(i);
                    const item = node.items[i];

                    if (item.type !== 'missing') {
                        advance(item);
                    }
                }
            }
        }
    };

    if (ast.type !== 'missing') {
        advance(ast);
    }

    conditionDefaultDataContext = conditionDefaultDataContext || hasConditionDefaultDataProvider(type, path[0]);

    return {
        type,
        path,
        node: componentNode,

        kind,
        tail,

        globalPath,
        parents,

        readableContext,
        writableContext,
        conditionDefaultDataContext
    };
};
