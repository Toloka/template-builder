import { addOrRemoveEntity } from './addOrRemoveEntity';

describe('field.text-annotation', () => {
    describe('addOrRemoveEntity', () => {
        it('should return `remove` when this entity is already fully annotated', () => {
            const newEntity = {
                label: 'a',
                offset: 10,
                length: 10
            };
            const oldEntities = [
                {
                    label: 'a',
                    offset: 10,
                    length: 10
                }
            ];

            expect(addOrRemoveEntity(newEntity, oldEntities)).toBe('remove');
        });
        it('should return `remove` when this entity is already over annotated', () => {
            const newEntity = {
                label: 'a',
                offset: 10,
                length: 10
            };
            const oldEntities = [
                {
                    label: 'a',
                    offset: 5,
                    length: 20
                }
            ];

            expect(addOrRemoveEntity(newEntity, oldEntities)).toBe('remove');
        });
        it('should return `add` when this entity is not annotated', () => {
            const newEntity = {
                label: 'a',
                offset: 10,
                length: 10
            };
            const oldEntities = [
                {
                    label: 'a',
                    offset: 0,
                    length: 5
                },
                {
                    label: 'b',
                    offset: 25,
                    length: 5
                }
            ];

            expect(addOrRemoveEntity(newEntity, oldEntities)).toBe('add');
        });
        it('should return `add` when entity position is annotated with another entity', () => {
            const newEntity = {
                label: 'a',
                offset: 10,
                length: 10
            };
            const oldEntities = [
                {
                    label: 'b',
                    offset: 5,
                    length: 20
                }
            ];

            expect(addOrRemoveEntity(newEntity, oldEntities)).toBe('add');
        });
        it('should return `add` when entity position is annotated different entities', () => {
            const newEntity = {
                label: 'a',
                offset: 10,
                length: 10
            };
            const oldEntities = [
                {
                    label: 'a',
                    offset: 10,
                    length: 5
                },
                {
                    label: 'b',
                    offset: 15,
                    length: 5
                }
            ];

            expect(addOrRemoveEntity(newEntity, oldEntities)).toBe('add');
        });
        it('should return `add` when entity position is partly annotated', () => {
            const newEntity = {
                label: 'a',
                offset: 10,
                length: 10
            };
            const oldEntities = [
                {
                    label: 'a',
                    offset: 8,
                    length: 4
                },
                {
                    label: 'a',
                    offset: 18,
                    length: 4
                }
            ];

            expect(addOrRemoveEntity(newEntity, oldEntities)).toBe('add');
        });
    });
});
