declare module 'toloka-img-annotation' {
    type Shape = {
        type: 'rectangle';
        data: {
            p1: { x: number; y: number };
            p2: { x: number; y: number };
        };
    };
    type Shapes = Shape[];

    export class ImageAnnotationEditor {
        constructor(image: string, shapes: Shapes);
        on(event: 'shapes:update', cb: (shapes: Shapes) => void): void;
        removeListener(event: 'shapes:update', cb: (shapes: Shapes) => void): void;
        shapes: Shapes;

        render(host: HTMLElement): void;
    }
}
