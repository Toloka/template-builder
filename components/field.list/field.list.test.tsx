import * as core from '@toloka-tb/core';
import * as fieldCheckbox from '@toloka-tb/field.checkbox';
import * as fieldText from '@toloka-tb/field.text';
import * as layoutColumns from '@toloka-tb/layout.columns';
import { configure, mount } from 'enzyme';
import { default as Adapter } from 'enzyme-adapter-react-16';
import React from 'react';

import * as fieldList from './field.list';

configure({ adapter: new Adapter() });

core.register(fieldCheckbox.create(core));
core.register(fieldText.create(core));
core.register(fieldList.create(core));
core.register(layoutColumns.create(core));

const getConfig = () => ({
    view: {
        type: 'field.list',
        buttonLabel: 'Добавить ещё +',
        label: 'Список покупок',
        data: {
            type: 'data.output',
            path: 'shopping.list'
        },
        render: {
            type: 'layout.columns',
            verticalAlign: 'middle',
            items: [
                {
                    type: 'field.text',
                    placeholder: 'Наименование',
                    data: {
                        type: 'data.relative',
                        path: 'title',
                        default: ''
                    }
                },
                {
                    type: 'field.checkbox',
                    label: 'В корзине',
                    data: {
                        type: 'data.relative',
                        path: 'got',
                        default: false
                    }
                }
            ]
        }
    },
    lock: {}
});

const makeCtx = () => {
    const ctx = core.makeCtxV2(core.compileConfig(getConfig()), {}, { formatMessage: () => 't' } as any);

    ctx.output.value = {
        shopping: {
            list: [
                {
                    title: 'Стол',
                    got: true
                },
                {
                    title: 'Кресло',
                    got: true
                },
                {
                    title: 'Цветок',
                    got: false
                }
            ]
        }
    };

    return ctx;
};

describe('field.list', () => {
    it('Should render to-do list', () => {
        const wrapper = mount(<core.Tb ctx={makeCtx()} />);

        expect(wrapper.find('input[type="text"]')).toHaveLength(3);
        expect(wrapper.find('input[type="checkbox"]')).toHaveLength(3);
        expect(wrapper.find('button[type="button"]')).toHaveLength(1);
    });

    it('Should allow user to edit items ', () => {
        const wrapper = mount(<core.Tb ctx={makeCtx()} />);
        const newText = 'Some another text';

        wrapper
            .find('input[type="text"]')
            .last()
            .simulate('change', { target: { value: newText } });
        expect(
            wrapper
                .find('input[type="text"]')
                .last()
                .props().value
        ).toBe(newText);
    });

    it('Should allow user to add more items ', () => {
        const wrapper = mount(<core.Tb ctx={makeCtx()} />);

        wrapper.find('button[type="button"]').simulate('click');
        wrapper.find('button[type="button"]').simulate('click');

        expect(wrapper.find('input[type="text"]')).toHaveLength(5);
        expect(wrapper.find('input[type="checkbox"]')).toHaveLength(5);
    });

    it('Should allow user to remove items ', () => {
        const wrapper = mount(<core.Tb ctx={makeCtx()} />);

        for (const _ of [0, 1]) {
            wrapper
                .find('svg')
                .last()
                .simulate('click', _);
        }

        expect(wrapper.find('input[type="text"]')).toHaveLength(1);
        expect(wrapper.find('input[type="checkbox"]')).toHaveLength(1);
    });

    it('Should allow user to remove all items', () => {
        const wrapper = mount(<core.Tb ctx={makeCtx()} />);

        for (const _ of [0, 1, 2]) {
            wrapper
                .find('svg')
                .last()
                .simulate('click', _);
        }

        expect(wrapper.find('input[type="text"]')).toHaveLength(0);
        expect(wrapper.find('input[type="checkbox"]')).toHaveLength(0);
    });

    it('Should allow user to clear items', () => {
        const wrapper = mount(<core.Tb ctx={makeCtx()} />);

        wrapper
            .find('input[type="text"]')
            .at(2)
            .simulate('change', { target: { value: 'Some Value' } });
        wrapper
            .find('input[type="text"]')
            .at(2)
            .simulate('change', { target: { value: '' } });
        expect(
            wrapper
                .find('input[type="text"]')
                .at(2)
                .props().value
        ).toBe('');
    });

    // temporarily disabled due to some issues related to react dom data storing. @v-trof knows details
    // it("Shouldn't update the whole list on item updated", () => {
    //     const wrapper = mount(<core.Tb config={getConfig()} />);

    //     const secondItemRenderId = wrapper
    //         .find('[data-test-id="list-item"]')
    //         .at(1)
    //         .getDOMNode()
    //         .getAttribute('data-test-render-id');

    //     wrapper
    //         .find('input[type="text"]')
    //         .at(0)
    //         .simulate('change', { target: { value: 'Some another value' } });

    //     expect(
    //         wrapper
    //             .find('[data-test-id="list-item"]')
    //             .at(1)
    //             .getDOMNode()
    //             .getAttribute('data-test-render-id')
    //     ).toBe(secondItemRenderId);
    // });
});
