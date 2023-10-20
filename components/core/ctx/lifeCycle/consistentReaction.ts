import { Reaction } from 'mobx';

// basically 2 things are different form mobx reaction
// 1) it is run instantly rather than being scheduled
// 2) it does not wrap `effect` in action as in lifeCycle we know that update is consistent
export const consistentReaction = <T>(expression: () => T, effect: (arg: T) => void, name: string) => {
    let value: T;

    const r = new Reaction(name, () => {
        r.track(() => {
            value = expression();
        });

        effect(value);
    });

    r.runReaction();

    return r.getDisposer();
};
