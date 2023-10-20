import { Editor } from '@toloka-tb/bootstrap/providers/providerDomain';
import { omit } from '@toloka-tb/common/utils/pick-omit';
import { JSONSchema7Definition } from 'json-schema';
import { reaction } from 'mobx';

import { getArchetype } from '../../components/Editor/lang/utils/getArchetype';
import { tbStore } from '../../store/tbStore';
import { ConditionConfig, DataConfig } from './getValidation';
import { Condition2Schema } from './helpers';

export type TransformedConditionSchema = {
    schema: object | boolean;
    required: boolean;
    invertRequired?: true;
};

export const conditionsMap: {
    [type: string]: { condition2Schema?: Condition2Schema<any> };
} = {};
export const fieldsMap: {
    [type: string]: Editor;
} = {};

let components: Editor[] = [];

reaction(
    () => tbStore.editors,
    () => {
        components = Object.values(tbStore.editors).filter((editor) => editor.schema) as Editor[];

        for (const component of components) {
            if (
                component &&
                component.schema &&
                component.schema.properties &&
                'type' in component.schema.properties &&
                typeof component.schema.properties.type === 'object'
            ) {
                const type: string = component.schema.title!;

                if (typeof type === 'string' && getArchetype(type) === 'condition') {
                    (conditionsMap as any)[type] = component;
                }
                if (typeof type === 'string' && getArchetype(type) === 'field') {
                    (fieldsMap as any)[type] = component;
                }
            }
        }
    }
);

export const transformCondition = (condition: ConditionConfig, fallbackData: DataConfig | undefined) => {
    let callCounter = 0;
    const transformer = (childCondition: ConditionConfig): { schema: JSONSchema7Definition; required: boolean } => {
        callCounter++;
        if (callCounter > 10000) {
            throw new Error('Infinite loop detect while mapping conditions to json schema');
        }
        const type = childCondition.type;

        if (childCondition.data) {
            if (!condition.data && !fallbackData) {
                return { schema: true, required: false };
            }
            const childDataType = childCondition.data.type;
            const childDataPath = childCondition.data.path;
            const dataType = (condition.data || fallbackData!).type;
            const dataPath = (condition.data || fallbackData!).path;

            if (childDataType !== dataType || childDataPath !== dataPath) {
                return { schema: true, required: false };
            }
        }
        if (conditionsMap[type] !== undefined && conditionsMap[type].condition2Schema !== undefined) {
            const mapper = conditionsMap[type].condition2Schema!;
            const props = omit(childCondition, ['type', 'data']);

            return mapper(props, transformer as any);
        } else {
            return { schema: true, required: false };
        }
    };

    return transformer(condition);
};
