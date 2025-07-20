import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRuleValue } from '../Interfaces';

export interface IAPIRuleFilter extends IBaseApiResponse {
  tempId: number;
  ruleId: number;
  order: number;
  propertyName: string;
  ruleLogicalOperator: IAPIRuleLogicalOperator;
  ruleConditionalOperator: IAPIRuleConditionalOperator;
  ruleEntityType: IAPIRuleEntityType;
  ruleField: IBaseApiResponse;
  ruleValues: IAPIRuleValue[];
}

interface IAPIRuleLogicalOperator extends IBaseApiResponse {
  ruleLogicalOperatorId: number;
}

interface IAPIRuleConditionalOperator extends IBaseApiResponse {
  ruleConditionalOperatorId: number;
}

interface IAPIRuleEntityType extends IBaseApiResponse {
  ruleEntityTypeId: number;
}

export interface IAPIRuleRequest extends IBaseApiResponse {
  order: number;
  propertyName: string;
  ruleLogicalOperatorId: number;
  ruleConditionalOperatorId: number;
  ruleEntityTypeId: number;
  ruleValues: IAPIRuleValue[];
}