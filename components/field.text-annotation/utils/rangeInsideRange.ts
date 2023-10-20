export const rangeInsideRange = (parent: [number, number], children: [number, number]) =>
    (parent[0] < children[0] && parent[1] > children[0]) ||
    (parent[0] < children[1] && parent[1] > children[1]) ||
    (parent[0] > children[0] && parent[1] < children[1]) ||
    (parent[0] === children[0] && parent[1] === children[1]);
