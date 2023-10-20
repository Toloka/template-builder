type Input<T> = T | Array<Input<T>>;

export const flatten = <T = unknown>(input: Array<Input<T>>): T[] => {
    const stack = [...input];
    const res: T[] = [];

    while (stack.length) {
        const next = stack.pop();

        if (Array.isArray(next)) {
            stack.push(...next);
        } else {
            res.push(next!);
        }
    }

    return res.reverse();
};
