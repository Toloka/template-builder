import { Entity } from '../ctx/ctx';

export const serialize = (providedEntities: Entity[] = []) => {
    const entities = providedEntities.filter(
        (entity) =>
            typeof entity === 'object' &&
            typeof entity.label === 'string' &&
            typeof entity.offset === 'number' &&
            typeof entity.length === 'number'
    );

    const sortedEnities = [...entities].sort((a, b) => a.offset + a.length - (b.offset + b.length));
    const endEntity = sortedEnities[sortedEnities.length - 1];
    const annotatedContentEnd = endEntity ? endEntity.offset + endEntity.length : 0;
    const contentAnnotation = Array(annotatedContentEnd)
        .fill(0)
        .map((): { entities: string[] } => ({ entities: [] }));

    for (const entity of entities) {
        for (let char = entity.offset; char < entity.offset + entity.length; char++) {
            contentAnnotation[char].entities.push(entity.label);
        }
    }

    const splitedEntities: Entity[] = [];
    let currentEntity: Entity | null = null;

    for (let char = 0; char < contentAnnotation.length; char++) {
        const { entities } = contentAnnotation[char];
        const name = entities[entities.length - 1];
        const currentName: string | undefined = currentEntity ? currentEntity.label : undefined;

        if (name !== currentName) {
            if (currentEntity) {
                splitedEntities.push(currentEntity);
                currentEntity = null;
            }

            if (name) {
                currentEntity = {
                    label: name,
                    offset: char,
                    length: 1
                };
            }
        } else if (currentEntity) {
            currentEntity.length++;
        }
    }

    if (currentEntity) {
        splitedEntities.push(currentEntity);
    }

    return splitedEntities;
};
