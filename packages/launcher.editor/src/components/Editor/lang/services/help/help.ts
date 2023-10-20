import { componentTranslateString } from '../../../../../i18n/componentsI18n';
import { ComponentPath } from '../../ast/astUtils';
import { CompatibleDescription, typeHandlers } from '../../typeHandlers/typeHandlers';
import { adjustForGenericsRecursevely } from '../../utils/adjustForGenerics';

export const capitalize = (str: string) => str.replace(/(^|\s)\S/, (l) => l.toUpperCase());

const getDescriptionResult = (description: CompatibleDescription, componentPath: ComponentPath): string | undefined => {
    const { translationKey, originalText } = description;
    const translatedDescription = translationKey && componentTranslateString(componentPath.type, translationKey);
    const shortDescription =
        translationKey === 'description' || translationKey === 'properties.type.description'
            ? componentTranslateString(componentPath.type, 'shortDescription')
            : undefined;

    return shortDescription || translatedDescription || originalText;
};

export const getHint = (componentPath: ComponentPath): string | undefined => {
    const adjustedPath = adjustForGenericsRecursevely(componentPath);

    if (adjustedPath !== componentPath) {
        return getHint(adjustedPath);
    }

    const handler = typeHandlers[componentPath.type];

    if (!handler) return;

    const possibleDescriptions = handler.getDescription(componentPath.path);

    const descriptionContainer = [...possibleDescriptions]
        .reverse()
        .find((description) => getDescriptionResult(description, componentPath));

    if (!descriptionContainer) return;

    const description = getDescriptionResult(descriptionContainer, componentPath);

    if (!description) return;

    const hint = `_${componentPath.type} "${componentPath.path.join('.')}"_\n\n${capitalize(description)}`;

    return hint;
};
