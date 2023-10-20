import { observable, runInAction } from 'mobx';

import { ShapeSetup } from './ctx';

export type Shape = {
    shape: string;
    label?: string;

    isEdited: boolean;
    isNew: boolean;
};

export type ShapeValue = {
    shape: string;
    label?: string;
};

export type Vertex = {
    left: number;
    top: number;
    shapeId: string;
    onMove: (left: number, top: number) => void;
};

export type ValueCtx = {
    vertices: {
        [id: string]: Vertex;
    };
    shapes: {
        [id: string]: Shape;
    };
    exportValue: ShapeValue[];
};

export type SerializeShape = (shapeId: string, value: ValueCtx) => ShapeValue;
export type HydarateShape = (value: any, ctx: ValueCtx) => void;

export const makeValueCtx = (shapeSetups: { [shape: string]: ShapeSetup }) => {
    let oldValue: ShapeValue[] = [];

    const ctx: ValueCtx = observable({
        vertices: {},
        shapes: {},

        get exportValue() {
            if (Object.values(ctx.shapes).some((shape) => shape.isEdited || shape.isNew)) {
                return oldValue;
            }

            const newValue = Object.keys(ctx.shapes).map((id) => shapeSetups[ctx.shapes[id].shape].serialize(id, ctx));

            oldValue = newValue;

            return newValue;
        },
        set exportValue(newValue) {
            runInAction(() => {
                oldValue = newValue;

                ctx.shapes = {};
                ctx.vertices = {};

                newValue.forEach((value) => {
                    shapeSetups[value.shape].hydrate(value, ctx);
                });
            });
        }
    });

    return ctx;
};
