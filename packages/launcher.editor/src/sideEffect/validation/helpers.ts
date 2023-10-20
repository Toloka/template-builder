import { ConditionCommonProps, ConditionResult } from '@toloka-tb/core/api/helpers/condition';

import { TransformedConditionSchema } from './conditionTransformer';

export const isGettable = (toCheck: any) => typeof toCheck === 'object' && typeof toCheck.type === 'string';

export type Condition2Schema<P = {}> = (
    props: P & ConditionCommonProps,
    transformChild: (child: ConditionResult) => TransformedConditionSchema
) => TransformedConditionSchema;
