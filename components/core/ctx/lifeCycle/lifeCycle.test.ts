/* eslint-disable max-nested-callbacks */
import { pick } from '@toloka-tb/common/utils/pick-omit';
import { autorun, reaction } from 'mobx';
import { createIntl } from 'react-intl';

import { childrenFromArray } from '../../api/childrenFromArray';
import { actionHelper, ContextualAction } from '../../api/helpers/action';
import { conditionHelperV2 } from '../../api/helpers/condition';
import { fieldHelper, FieldProps, fieldWithChildrenHelper } from '../../api/helpers/field';
import { helperHelper } from '../../api/helpers/helper';
import { ViewConfig, viewHelper, viewWithChildrenHelper } from '../../api/helpers/view';
import { ComponentConfig, TbConfig } from '../../compileConfig/compileConfig';
import { Child } from '../../coreComponentApi';
import { dataInput } from '../../data/input';
import { dataLocal } from '../../data/local';
import { dataRelative } from '../../data/relative';
import { dataOutput } from '../../data/rw';
import { dataSub } from '../../data/sub';
import { makeGetter, resolveGetters } from '../../resolveGetters/resolveGetters';
import { makeCtxBag } from '../ctxBag';
import { initCtx, makeCtx, makeEmptyCtx } from '../tbCtx';
import { TbNode } from './lifeCycleTypes';

const intl = createIntl({ locale: 'en' });
const list = viewWithChildrenHelper(
    'test.list',
    (props: { items: ComponentConfig[] }) => childrenFromArray(props.items as any),
    () => null
);

const dynList = viewWithChildrenHelper(
    'test.list',
    (props: { items: any[]; render: ComponentConfig }, bag) => {
        const children: { [key: string]: Child } = {};

        const value = props.items || [];

        for (let i = 0; i < value.length; ++i) {
            const itemBag = {
                ...bag,
                data: {
                    ...bag.data,
                    local: {
                        item: value[i],
                        index: i
                    }
                }
            };

            children[i] = resolveGetters(props.render, itemBag);
        }

        return children;
    },
    () => null,
    {
        unresolvableProps: ['render']
    }
);

const eq = conditionHelperV2(
    'eq',
    ({ data, to }: { data: any; to: any }) => data === to,
    () => ({
        direct: () => ({ message: 'must eq' }),
        opposite: () => ({ message: 'must not eq' })
    })
);

type FieldListProps = FieldProps<any[]> & { render: ComponentConfig };

const fieldList = fieldWithChildrenHelper<FieldListProps, any>(
    'test.list',
    (props, bag) => {
        const children: { [key: string]: Child } = {};
        const value = props.value || [];

        for (let i = 0; i < value.length; ++i) {
            const itemBag = {
                ...bag,
                data: {
                    local: {
                        item: value[i],
                        index: i
                    },
                    relative: [
                        ...bag.data.relative,
                        dataSub({
                            parent: bag.component.data,
                            path: String(i)
                        })
                    ]
                }
            };

            children[i] = resolveGetters(props.render, itemBag);
        }

        return children;
    },
    () => null,
    {
        unresolvableProps: ['render']
    }
);

const view = viewHelper('test.view', (props: { label?: string }) => (props.label ? null : null));

const field = fieldHelper('test.field', () => null);

const isTrue: any = helperHelper((props: { data: any; then: any; else?: any }) =>
    props.data ? props.then : props.else
);

const defaultField = field({ data: dataOutput({ path: 'out' }), label: 'defaultField' });
const altField = field({ data: dataOutput({ path: 'alt' }), label: 'altField' });

const defaultView = view({ label: 'defaultView' });

const makeConfig = (base: Pick<TbConfig, 'plugins' | 'view'>): TbConfig => ({
    ...base,
    core: undefined
});

const configLists = makeConfig({
    view: list({
        items: [list({ items: [view({}), view({})] }), defaultField, view({}), view({})]
    }),
    plugins: []
});

const configIf = makeConfig({
    view: list({
        items: [isTrue({ data: dataInput({ path: 'if' }), then: defaultView }), defaultField]
    }),
    plugins: []
});

const makeDynCtx = (defaultValue: boolean[] = []) => {
    const configDyn = makeConfig({
        view: dynList({
            items: dataOutput({ path: 'list' }) as any,
            render: isTrue({
                data: dataLocal({ path: 'item' }),
                then: defaultView,
                else: defaultField
            })
        }),
        plugins: []
    });

    const ctx = makeCtx(configDyn, {});

    (ctx.output.value.list as boolean[]) = defaultValue;

    return ctx;
};

const configValidation = makeConfig({
    view: field({
        data: dataOutput({ path: 'out' }),
        validation: eq({ data: dataOutput({ path: 'out' }), to: 'valid' })
    }),
    plugins: []
});

const expectMatch = (node: TbNode, view: ViewConfig) => {
    expect(view).toBe(node.config);

    const items: ViewConfig[] = view.props.items;

    if (items) {
        items.forEach((item, idx) => {
            expectMatch(node.children[idx], item);
        });
    }
};
const expectDestroyed = (node: TbNode, view: ViewConfig) => {
    expect(node.destroyed).toBe(true);

    const items: ViewConfig[] = view.props.items;

    if (items) {
        items.forEach((item, idx) => {
            expectDestroyed(node.children[idx], item);
        });
    }
};

describe('lifeCycle', () => {
    describe('Child management', () => {
        it('Constructs view tree root', () => {
            const configMinimal = makeConfig({
                view: list({ items: [] }),
                plugins: []
            });

            const ctx = makeCtx(configMinimal, {});

            expect(ctx.tree!.config).toBe(configMinimal.view);
            expect(ctx.tree!.children).toEqual({});
            expect(ctx.tree!.bag.tb).toBe(ctx);

            ctx.tree!.destroy();
        });

        it('Constructs view tree', () => {
            const ctx = makeCtx(configLists, {});

            expectMatch(ctx.tree!, ctx.config.view);

            ctx.tree!.destroy();
        });

        it('Destroys all children when parent is destroyed', () => {
            const ctx = makeCtx(configLists, {});

            ctx.tree!.destroy();

            expectDestroyed(ctx.tree!, ctx.config.view);
        });

        it('Updates it correctly when if adds a component', () => {
            const ctx = makeCtx(configIf, { if: false });

            expect(ctx.tree!.children[0]).toBe(undefined);
            expect(ctx.tree!.children[1].config).toBe(defaultField);

            ctx.input = { if: true };

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultField);

            ctx.tree!.destroy();
        });
        it('Updates it correctly when if removes a component', () => {
            const ctx = makeCtx(configIf, { if: true });

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultField);

            const nodeToDie = ctx.tree!.children[0];

            ctx.input = { if: false };

            expect(nodeToDie.destroyed).toBe(true);
            expect(ctx.tree!.children[0]).toBe(undefined);
            expect(ctx.tree!.children[1].config).toBe(defaultField);

            ctx.tree!.destroy();
        });

        it('Adds data ctx to the bag', () => {
            const configDyn = makeConfig({
                view: dynList({
                    items: [true, false, true],
                    render: isTrue({
                        data: dataLocal({ path: 'item' }),
                        then: defaultView,
                        else: defaultField
                    })
                }),
                plugins: []
            });

            const ctx = makeCtx(configDyn, {});

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultField);
            expect(ctx.tree!.children[2].config).toBe(defaultView);

            ctx.tree!.destroy();
        });
        it('Updates it correctly when an item is added to a list', () => {
            const ctx = makeDynCtx([true, true]);

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultView);
            expect(ctx.tree!.children[2]).toBe(undefined);

            ((ctx.output.value.list as boolean[]) as boolean[]).push(false);

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultView);
            expect(ctx.tree!.children[2].config).toBe(defaultField);
        });
        it('Updates it correctly when an item is removed form a list', () => {
            const ctx = makeDynCtx([true, true, false]);

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultView);
            expect(ctx.tree!.children[2].config).toBe(defaultField);

            const oldEndNode = ctx.tree!.children[2];

            // end delete
            ((ctx.output.value.list as boolean[]) as boolean[]).pop();

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultView);
            expect(ctx.tree!.children[2]).toBe(undefined);
            expect(oldEndNode.destroyed).toBe(true);

            // middle delete
            ((ctx.output.value.list as boolean[]) as boolean[]).push(false);
            const startNode = ctx.tree!.children[0];
            const endNode = ctx.tree!.children[2];

            ((ctx.output.value.list as boolean[]) as boolean[]).splice(0, 1);

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultField);
            expect(ctx.tree!.children[2]).toBe(undefined);

            expect(startNode.destroyed).toBe(false);
            expect(endNode.destroyed).toBe(true);
        });
        it('Updates it correctly when an item is replaced in a list', () => {
            const ctx = makeDynCtx([true, true, false]);

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultView);
            expect(ctx.tree!.children[2].config).toBe(defaultField);

            // change the middle
            (ctx.output.value.list as boolean[])[1] = false;

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultField);
            expect(ctx.tree!.children[2].config).toBe(defaultField);
        });
        it('Updates it correctly when the whole list is changed via getter', () => {
            const ctx = makeDynCtx([true, true, false]);

            expect(ctx.tree!.children[0].config).toBe(defaultView);
            expect(ctx.tree!.children[1].config).toBe(defaultView);
            expect(ctx.tree!.children[2].config).toBe(defaultField);

            // change the middle
            (ctx.output.value.list as boolean[]) = [false, true, true];

            expect(ctx.tree!.children[0].config).toBe(defaultField);
            expect(ctx.tree!.children[1].config).toBe(defaultView);
            expect(ctx.tree!.children[2].config).toBe(defaultView);
        });

        it('Is not changed if the same item is passed', () => {
            const ctx = makeCtx(configIf, { if: false });

            expect(ctx.tree!.children[0]).toBe(undefined);
            expect(ctx.tree!.children[1].config).toBe(defaultField);

            const nodeToKeep = ctx.tree!.children[1];

            let didTrigger = false;

            reaction(
                () => nodeToKeep.props,
                () => {
                    didTrigger = true;
                }
            );

            ctx.input = { if: true };

            expect(didTrigger).toBe(false);

            ctx.tree!.destroy();
        });

        // WE DIDN'T IMPLEMENT it('Updates it correctly for nested dynamic lists', () => {});
    });

    describe('Actions context', () => {
        it('preserves context on getting', () => {
            const tbCtx = makeCtx(
                makeConfig({
                    view: view({}),
                    plugins: []
                }),
                {}
            );

            let localDataConetnt = '';
            const targetLocalDataContent = 'fake-data-ctx';

            const actionNotify = actionHelper<ContextualAction<any, any>>({
                type: 'action.notify',
                uses: ['ctxBag'],
                apply: (action: any) => {
                    localDataConetnt = action.ctxBag.data.local.content;
                }
            });

            const providedCtxBag = makeCtxBag(tbCtx, {
                data: { local: { content: targetLocalDataContent }, relative: [] }
            });
            const action = actionNotify({});

            const resolvedAction = resolveGetters(action, providedCtxBag);

            tbCtx.dispatch(resolvedAction, makeCtxBag(tbCtx));

            expect(localDataConetnt).toBe(targetLocalDataContent);
        });
    });

    describe('Validation management', () => {
        it('Validates on node creation', () => {
            const ctx = makeCtx(configValidation, {});

            expect(ctx.tree!.validationError!.message).toBe('must eq');
        });
        it('Removes error when node is destroyed', () => {
            const ctx = makeCtx(configValidation, {});

            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.tree!.destroy();
            expect(ctx.isValid).toBe(true);
        });

        it('Updates validation when value is changed (same data)', () => {
            const ctx = makeCtx(configValidation, {});

            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.output.value.out = 'valid';
            expect(ctx.tree!.validationError!).toBe(undefined);
        });

        it('Updates when data is changed (dynamic path)', () => {
            const configValidationDynamicData = makeConfig({
                view: field({
                    data: dataOutput({
                        path: isTrue({
                            data: dataInput({ path: 'if' }),
                            then: 'out',
                            else: 'alt'
                        })
                    }),
                    validation: eq({ to: 'valid' } as any)
                }),
                plugins: []
            });

            const ctx = makeCtx(configValidationDynamicData, { if: true });

            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.output.value.out = 'valid';
            expect(ctx.tree!.validationError!).toBe(undefined);

            ctx.input = { if: false };
            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.input = { if: true };
            expect(ctx.tree!.validationError!).toBe(undefined);
        });

        it('Updates validation when data condition is changed', () => {
            const configValidationIfCondition = makeConfig({
                view: field({
                    data: dataOutput({ path: 'out' }),
                    validation: isTrue({
                        data: dataInput({ path: 'if' }),
                        then: eq({ to: 'valid' } as any),
                        else: eq({ to: 'alt-val' } as any)
                    })
                }),

                plugins: []
            });

            const ctx = makeCtx(configValidationIfCondition, { if: true });

            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.output.value.out = 'valid';
            expect(ctx.tree!.validationError!).toBe(undefined);

            ctx.input = { if: false };
            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.input = { if: true };
            expect(ctx.tree!.validationError!).toBe(undefined);
        });

        it('Updates validation when config is changed', () => {
            const fValid = field({
                data: dataOutput({ path: 'out' }),
                validation: eq({ data: dataOutput({ path: 'out' }), to: 'valid' })
            });

            const fAltVal = field({
                data: dataOutput({ path: 'out' }),
                validation: eq({ data: dataOutput({ path: 'out' }), to: 'alt-val' })
            });

            const configValidationIfConfig = makeConfig({
                view: isTrue({
                    data: dataInput({ path: 'if' }),
                    then: fValid,
                    else: fAltVal
                }),

                plugins: []
            });

            const ctx = makeCtx(configValidationIfConfig, { if: true });

            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.output.value.out = 'valid';
            expect(ctx.tree!.validationError!).toBe(undefined);

            ctx.input = { if: false };
            expect(ctx.tree!.validationError!.message).toBe('must eq');

            ctx.input = { if: true };
            expect(ctx.tree!.validationError!).toBe(undefined);
        });

        it('Does work for dynamic items (same config, different node/data)', () => {
            const cfg = makeConfig({
                view: fieldList({
                    data: dataOutput({ path: 'arr' }),
                    render: field({
                        data: dataRelative({ path: '' }),
                        validation: eq({ to: 'valid' } as any)
                    })
                }),
                plugins: []
            });

            const ctx = makeCtx(cfg, {});

            ctx.output.value.arr = ['wow', 'valid'];

            const getValidation = (idx: number) => ctx.tree!.children[idx].validationError!;

            expect(getValidation(0).message).toBe('must eq');
            expect(getValidation(1)).toBe(undefined);

            (ctx.output.value.arr as any[]).push('kek');
            expect(getValidation(0).message).toBe('must eq');
            expect(getValidation(1)).toBe(undefined);
            expect(getValidation(2).message).toBe('must eq');

            (ctx.output.value.arr as any[])[2] = 'valid';
            expect(getValidation(0).message).toBe('must eq');
            expect(getValidation(1)).toBe(undefined);
            expect(getValidation(2)).toBe(undefined);

            (ctx.output.value.arr as any[]).shift();
            expect(ctx.isValid).toBe(true);
        });

        // WE DIDN'T IMPLEMENT it('Updates when data is changed (if on data object)', () => {});
    });

    describe('FieldValue management', () => {
        it('Resurrects & subscribes on mount', () => {
            const configField = makeConfig({
                view: defaultField,
                plugins: []
            });

            const ctx = makeEmptyCtx();

            ctx.output.graveyard.out = 'target-value';

            initCtx(ctx, configField, {}, intl);

            expect(ctx.output.value.out).toBe('target-value');
            expect(ctx.output.valueUsage.out.length).toBe(1);

            ctx.tree!.destroy();
        });

        it('Applies default value for untouched fields', () => {
            const configFieldDefault = makeConfig({
                view: field({ data: dataOutput({ path: 'path', default: 'tets' }) }),
                plugins: []
            });
            const ctx = makeCtx(configFieldDefault, {});

            expect(ctx.output.value.path).toBe('tets');
        });
        it('Does not apply default value for touched fields', () => {
            const configFieldDefault = makeConfig({
                view: field({ data: dataOutput({ path: 'path', default: 'tets' }) }),
                plugins: []
            });

            const ctx = makeEmptyCtx();

            ctx.output.touched = { path: true };

            initCtx(ctx, configFieldDefault, {}, intl);

            expect(ctx.output.value.path).toBe(undefined);
        });
        it('Does not touch form only on default data ', () => {
            const conditionEqualsCreator = conditionHelperV2<{ data?: any; to: any }, ''>(
                'equals',
                (props) => typeof props.data === props.to,
                () => ({
                    direct: () => ({ message: `must be equal` }),
                    opposite: () => ({ message: `must be not equal` })
                })
            );
            const configFieldDefault = makeConfig({
                view: field({
                    data: dataOutput({ path: 'path', default: 'tets' }),
                    validation: conditionEqualsCreator({ to: 'another value' })
                }),
                plugins: []
            });
            const ctx = makeCtx(configFieldDefault, {});

            expect(ctx.isTouched).toBeFalsy();
        });
        it('Applies default value even if it is falsy', () => {
            const configFieldDefault0 = makeConfig({
                view: field({ data: dataOutput({ path: 'path', default: 0 }) }),
                plugins: []
            });

            const ctxZero = makeCtx(configFieldDefault0, {});

            expect(ctxZero.output.value.path).toBe(0);

            const configFieldDefaultFalse = makeConfig({
                view: field({ data: dataOutput({ path: 'path', default: false }) }),
                plugins: []
            });
            const ctxFalse = makeCtx(configFieldDefaultFalse, {});

            expect(ctxFalse.output.value.path).toBe(false);
        });
        it("Does not override triggers/parent default with it's own", () => {
            const configFieldDefault = makeConfig({
                view: field({ data: dataOutput({ path: 'path', default: 'tets' }) }),
                plugins: []
            });

            const ctx = makeEmptyCtx();

            ctx.output.value = { path: false };

            initCtx(ctx, configFieldDefault, {}, intl);

            expect(ctx.output.value.path).toBe(false);
        });
        it('Buries on unmount', () => {
            const configField = makeConfig({
                view: defaultField,
                plugins: []
            });

            const ctx = makeCtx(configField, {});

            ctx.output.value.out = 'kek';

            ctx.tree!.destroy();

            expect(ctx.output.graveyard.out).toBe('kek');
            expect(ctx.output.value.out).toBeUndefined();
        });

        it('Updates when data is changed (config change)', () => {
            const configFieldIf = makeConfig({
                view: isTrue({ data: dataInput({ path: 'if' }), then: defaultField, else: altField }),
                plugins: []
            });

            const ctx = makeCtx(configFieldIf, { if: true });

            ctx.output.value.out = 'test-value-1';
            ctx.output.graveyard.alt = 'test-value-2';

            expect(ctx.output.valueUsage.out.length).toBe(1);

            // ctx.output.resurrect = jest.fn();
            // ctx.output.bury = jest.fn();

            ctx.input = { if: false };

            expect(ctx.output.graveyard.out).toBe('test-value-1');
            expect(ctx.output.value.alt).toBe('test-value-2');

            expect(ctx.output.valueUsage.out.length).toBe(0);
            expect(ctx.output.valueUsage.alt.length).toBe(1);

            ctx.tree!.destroy();
        });
        it('Updates when data is changed (dynamic path)', () => {
            const configFieldIf = makeConfig({
                view: field({
                    data: dataOutput({ path: isTrue({ data: dataInput({ path: 'if' }), then: 'out', else: 'alt' }) })
                }),
                plugins: []
            });

            const ctx = makeCtx(configFieldIf, { if: true });

            expect(ctx.output.valueUsage.out.length).toBe(1);

            ctx.output.value.out = 'test-value-1';
            ctx.output.graveyard.alt = 'test-value-2';

            ctx.input = { if: false };

            expect(ctx.output.graveyard.out).toBe('test-value-1');
            expect(ctx.output.value.alt).toBe('test-value-2');

            expect(ctx.output.valueUsage.out.length).toBe(0);
            expect(ctx.output.valueUsage.alt.length).toBe(1);

            ctx.tree!.destroy();
        });

        it('Does work for dynamic items (same config, different data)', () => {
            const cfg = makeConfig({
                view: fieldList({
                    data: dataOutput({ path: 'arr' }),
                    render: field({
                        data: dataRelative({ path: '' })
                    })
                }),
                plugins: []
            });

            const ctx = makeCtx(cfg, {});

            ctx.output.value.arr = ['wow', 'magic'];

            expect(ctx.output.valueUsage.arr).toHaveLength(1);

            // add
            (ctx.output.value.arr as any[]).push('kek');
            expect(ctx.output.valueUsage.arr).toHaveLength(1);

            // remove
            (ctx.output.value.arr as any[]).shift();
            expect(ctx.output.valueUsage.arr).toHaveLength(1);

            expect(ctx.output.value.arr).toMatchObject(['magic', 'kek']);
        });

        // WE DIDN'T IMPLEMENT it('Updates when data is changed (if on data object)', () => {});
        // WE DIDN'T IMPLEMENT it('Buries view error with data error', () => {});
    });

    describe('ContextData mapping (data.map)', () => {
        it('maps default data', () => {
            const mappedOutputFieldCreator = fieldHelper('field.double-output', () => null, {
                mapContextData: {
                    mapValue: () => `mapped-value`,
                    mapPath: (basePath) => [basePath]
                }
            });

            const config = makeConfig({
                view: mappedOutputFieldCreator({
                    data: dataOutput({ path: 'out', default: 'initValue' })
                }),
                plugins: []
            });

            const ctx = makeCtx(config, {});

            initCtx(ctx, config, {}, intl);

            expect(ctx.output.value.out).toBe('mapped-value');

            ctx.destroy();
        });
        it('maps context data for conditions', () => {
            let caughtValue: string | undefined = 'not-caught';
            const valueCatcherConditionCreator = conditionHelperV2<{ data?: string }, never>(
                'catch',
                (props) => {
                    caughtValue = props.data;

                    return true;
                },
                () => ({ direct: () => ({ message: '' }), opposite: () => ({ message: '' }) })
            );
            const mappedOutputFieldCreator = fieldHelper('field.double-output', () => null, {
                mapContextData: {
                    mapValue: () => `mapped-value`,
                    mapPath: (basePath) => [basePath]
                }
            });

            const config = makeConfig({
                view: mappedOutputFieldCreator({
                    data: dataOutput({ path: 'out', default: 'initValue' }),
                    validation: valueCatcherConditionCreator({})
                }),
                plugins: []
            });

            const ctx = makeCtx(config, {});

            initCtx(ctx, config, {}, intl);

            expect(ctx.isValid).toBeTruthy();
            expect(caughtValue).toBe('mapped-value');

            ctx.destroy();
        });
        it('resolves getter props for data mapper', () => {
            let caughtValue: string | undefined = 'not-caught';
            const valueCatcherConditionCreator = conditionHelperV2<{ data?: string }, never>(
                'cather',
                (props) => {
                    caughtValue = props.data;

                    return true;
                },
                () => ({ direct: () => ({ message: '' }), opposite: () => ({ message: '' }) })
            );
            const mappedOutputFieldCreator = fieldHelper<FieldProps<string> & { options: number[] }>(
                'field.double-output',
                () => null,
                {
                    mapContextData: {
                        mapValue: (_, props) => props.options.map((x) => x * x).join(','),
                        mapPath: (basePath) => [basePath]
                    }
                }
            );

            const config = makeConfig({
                view: mappedOutputFieldCreator({
                    data: dataOutput<string | undefined>({ path: 'out', default: 'initValue' }),
                    options: makeGetter(() => [1, 2, 3]) as any,
                    validation: valueCatcherConditionCreator({})
                }),
                plugins: []
            });

            const ctx = makeCtx(config, {});

            initCtx(ctx, config, {}, intl);

            expect(ctx.isValid).toBeTruthy();
            expect(caughtValue).toBe('1,4,9');

            ctx.destroy();
        });
        it('maps used data paths', () => {
            const mappedOutputFieldCreator = fieldHelper('field.double-output', () => null, {
                mapContextData: {
                    mapValue: () => `mapped-value`,
                    mapPath: (basePath) => ['foo', `${basePath}Bar`]
                }
            });

            const config = makeConfig({
                view: mappedOutputFieldCreator({
                    data: dataOutput({ path: 'out' })
                }),
                plugins: []
            });

            const ctx = makeCtx(config, {});

            initCtx(ctx, config, {}, intl);

            expect(ctx.output.valueUsage.foo.length > 0);
            expect(ctx.output.valueUsage.outBar.length > 0);

            ctx.destroy();
        });
        it('allowes to write object on root', () => {
            type FieldCheckboxGroupProps = {
                options: Array<{
                    label: string;
                    value: string;
                }>;
            } & FieldProps<{ [key: string]: boolean }>;
            type ViewListProps = {
                items: Child[];
            };
            const fieldCheckboxCreator = fieldHelper('field.checkbox', () => null);
            const viewListCreator = viewWithChildrenHelper(
                'view.list',
                (props: ViewListProps) => childrenFromArray(props.items),
                () => null
            );
            const checkboxGroupFieldCreator = fieldWithChildrenHelper(
                'field.checkbox-group',
                (props: FieldCheckboxGroupProps, bag) => {
                    const items = (props.options.filter(Boolean).map((option) =>
                        fieldCheckboxCreator({
                            data: dataSub<boolean | undefined>({
                                parent: bag.component.data,
                                path: String(option.value)
                            })
                        })
                    ) as any) as Child[];

                    return {
                        list: viewListCreator({ items })
                    };
                },
                (props) => props.children.list,
                {
                    mapContextData: {
                        mapValue: (value, props) => {
                            if (typeof value !== 'object') return value;

                            const mapped = pick(
                                value,
                                props.options.map(({ value }) => value)
                            );

                            if (Object.keys(mapped).length === 0) return undefined;

                            return mapped;
                        },
                        mapPath: (basePath, props) =>
                            props.options.map(({ value }) => [basePath, value].filter((path) => path !== '').join('.'))
                    }
                }
            );
            const conditionRequiredCreator = conditionHelperV2<{ data?: any }, never>(
                'required',
                (props) => typeof props.data !== 'undefined',
                () => ({
                    direct: () => ({ message: `required` }),
                    opposite: () => ({ message: `not required` })
                })
            );

            const componentData = dataOutput<{ [key: string]: boolean } | undefined>({
                path: '',
                default: {
                    path1: true
                }
            });

            const config = makeConfig({
                view: checkboxGroupFieldCreator({
                    data: componentData,
                    options: [
                        {
                            value: 'path1',
                            label: ''
                        },
                        {
                            value: 'path2',
                            label: ''
                        }
                    ],
                    validation: conditionRequiredCreator({})
                }),
                plugins: []
            });

            const ctx = makeCtx(config, {});

            initCtx(ctx, config, {}, intl);

            expect(ctx.output.value).toMatchObject({ path1: true });

            componentData.set(undefined, 'path1', makeCtxBag(ctx));

            expect(ctx.isValid).toBeFalsy();

            ctx.output.value.notUsedInCheckboxPath = true;

            expect(ctx.isValid).toBeFalsy();

            ctx.destroy();
        });
    });

    it('supports rawValue field', () => {
        let lastValue: number | undefined = -1;
        let change = () => {
            /* will be set later */
        };

        const fieldInt = fieldHelper<FieldProps<string, number>>(
            'test.field',
            (props) => {
                lastValue = props.value;

                change = () => props.onChange(15);

                return null;
            },
            {
                rawValue: {
                    parse: (int) => String(int),
                    serialize: (str) => (str ? parseInt(str, 10) : undefined),
                    validate: () => undefined
                }
            }
        );

        const cfg = makeConfig({
            view: fieldInt({
                data: dataOutput({ path: 'str' })
            }),
            plugins: []
        });

        const ctx = makeCtx(cfg, {});

        // cheap react-mobx render simulation
        const dispose = autorun(() => (ctx.tree!.config.component as any)(ctx.tree!.props));

        expect(lastValue).toBe(undefined);

        ctx.output.value.str = '666';
        expect(lastValue).toBe(666);

        change();
        expect(ctx.output.value.str).toBe('15');
        expect(lastValue).toBe(15);

        dispose();
    });

    it('updates if rawValue changes, while parsed value does not', () => {
        let lastValue: string | undefined = '';
        let change = (newValue: string) => newValue;

        const fieldTrim = fieldHelper<FieldProps<string, string>>(
            'test.field',
            (props) => {
                lastValue = props.value;

                change = (newValue) => {
                    props.onChange(newValue);

                    return newValue;
                };

                return null;
            },
            {
                rawValue: {
                    parse: (str) => (str || '').trim(),
                    serialize: (str) => str,
                    validate: () => undefined
                }
            }
        );

        const cfg = makeConfig({
            view: fieldTrim({
                data: dataOutput({ path: 'str' })
            }),
            plugins: []
        });

        const ctx = makeCtx(cfg, {});

        // cheap react-mobx render simulation
        const dispose = autorun(() => (ctx.tree!.config.component as any)(ctx.tree!.props));

        expect(lastValue).toBe(undefined);

        ctx.output.value.str = 'wow';
        expect(lastValue).toBe('wow');

        change('meow');
        expect(ctx.output.value.str).toBe('meow');
        expect(lastValue).toBe('meow');

        change('meow ');
        expect(ctx.output.value.str).toBe('meow'); // trimmed
        expect(lastValue).toBe('meow '); // not trimmed

        change('meow purr');
        expect(ctx.output.value.str).toBe('meow purr');
        expect(lastValue).toBe('meow purr');

        dispose();
    });

    it('Allows field to validate itself based on parsed, rawValue and props', () => {
        let lastValue: string | undefined = '';
        let change = (newValue: string) => newValue;

        const fieldNumberString = fieldHelper<FieldProps<string, string> & { allowZero: boolean }>(
            'test.field',
            (props) => {
                lastValue = props.value;

                change = (newValue) => {
                    props.onChange(newValue);

                    return newValue;
                };

                return null;
            },
            {
                rawValue: {
                    parse: (str) => str && str.replace(/[^0-9]/g, ''),
                    serialize: (str) => str,
                    validate: (parsed, _, props) => {
                        if (!parsed) {
                            return 'LEN';
                        }

                        if (!/^[0-9]+$/.test(parsed)) {
                            return 'NUM';
                        }

                        if (!props.allowZero && parsed.includes('0')) {
                            return '0';
                        }
                    }
                }
            }
        );

        const cfg = makeConfig({
            view: fieldNumberString({
                data: dataOutput({ path: 'str' }),
                allowZero: true
            }),
            plugins: []
        });

        const ctx = makeCtx(cfg, {});

        // cheap react-mobx render simulation
        const dispose = autorun(() => (ctx.tree!.config.component as any)(ctx.tree!.props));

        expect(lastValue).toBe(undefined);
        expect(ctx.tree!.validationError!.message).toBe('LEN');

        change('+666 000');
        expect(ctx.output.value.str).toBe('666000');
        expect(ctx.tree!.validationError!).toBe(undefined);

        ctx.output.value.str = '+60';
        expect(ctx.tree!.validationError!.message).toBe('NUM');

        dispose();

        const cfgNoZero = makeConfig({
            view: fieldNumberString({
                data: dataOutput({ path: 'str' }),
                allowZero: false
            }),
            plugins: []
        });

        const ctxNoZero = makeCtx(cfgNoZero, {});

        // cheap react-mobx render simulation
        const disposeNoZero = autorun(() => (ctxNoZero.tree!.config.component as any)(ctxNoZero.tree!.props));

        change('666 000');
        expect(ctxNoZero.output.value.str).toBe('666000');
        expect(ctxNoZero.tree!.validationError!.message).toBe('0');

        disposeNoZero();
    });
});
