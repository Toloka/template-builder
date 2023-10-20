import { Entity } from '../ctx/ctx';
export const addOrRemoveEntity = (newEntity: Entity, oldEntities: Entity[]): 'add' | 'remove' => {
    return oldEntities.some(
        (oldEntity) =>
            oldEntity.label === newEntity.label &&
            oldEntity.offset <= newEntity.offset &&
            oldEntity.offset + oldEntity.length >= newEntity.offset + newEntity.length
    )
        ? 'remove'
        : 'add';
};
