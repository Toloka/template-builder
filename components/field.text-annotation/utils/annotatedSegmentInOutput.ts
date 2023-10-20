import { Entity } from '../ctx/ctx';

export type EntityWithSegment = Entity & { segment: string };

export const addSegments = (entities: Entity[], textContent: string): EntityWithSegment[] =>
    entities.map((entity) => ({ ...entity, segment: textContent.substr(entity.offset, entity.length) }));

export const cleanupSegment = (entities: EntityWithSegment[]): Entity[] =>
    entities.map((entity) => ({ label: entity.label, offset: entity.offset, length: entity.length }));
