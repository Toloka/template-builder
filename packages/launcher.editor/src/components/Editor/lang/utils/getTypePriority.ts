import { ComponentPath } from '../ast/astUtils';
import { getArchetype } from './getArchetype';

// we reverse so indexOf could be used to determine result (higher is better)
// while people prefer first items being first
export const likely = [
    'view.list',
    'view.text',
    'field.text',
    'field.checkbox-group',
    'field.radio-group',
    'data.local',
    'data.relative',
    'condition.required'
].reverse();
export const unlikely = ['helper.switch', 'condition.any', 'condition.all', 'view.debug', 'action.notify'];
export const situationalArcheTypes = ['plugin', 'action', 'condition', 'data', 'helper'].reverse();

export const getTypePriority = (type: string, componentPath: ComponentPath) => {
    if (componentPath.globalPath.length <= 2 && getArchetype(type) === 'layout') {
        return 70;
    }

    // put the most likely options above other
    const likelyIndex = likely.indexOf(type);

    if (likelyIndex !== -1) {
        return 55 + likelyIndex;
    }

    // put the most unlikely options below all other
    const unlikelyIndex = unlikely.indexOf(type);

    if (unlikelyIndex !== -1) {
        return 45 - unlikelyIndex;
    }

    // maybe increase priority of situational types, if they are suggested they are likely to be used
    const situationalTypeIndex = situationalArcheTypes.findIndex((archeType) => getArchetype(type) === archeType);

    return 50 + situationalTypeIndex;
};
