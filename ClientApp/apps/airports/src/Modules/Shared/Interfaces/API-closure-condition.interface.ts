import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICondition extends IBaseApiResponse {
  conditionId?: number;
  condition?: string;
  conditionValueId?: number;
  airportHoursConditionValues?: IAPIConditionValue[];
  conditionTypeId: number;
  conditionalOperatorId: number;
  conditionType?: IAPIConditionType;
  conditionalOperator?: IAPIConditionalOperator;
}

export interface IAPIConditionType extends IBaseApiResponse {
  conditionTypeId?: number;
  sequenceId: number;
  description: string;
}

export interface IAPIConditionValue {
  id: number;
  airportHoursConditionValueId?: number;
  conditionId: number;
  entityValueId: number;
  entityValueCode: string;
  entityValue: string;
}

export interface IAPIConditionalOperator extends IBaseApiResponse {
  conditionalOperatorId?: number;
  operator: string;
}
