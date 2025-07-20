import { IBaseApiResponse } from '@wings-shared/core';
import { IAPIRuleFilter, IAPIRuleRequest } from './API-rule-filter.interface';

export interface IAPIPermitExceptionRule extends IBaseApiResponse {
  tempId: number;
  permitExceptionRuleId: number;
  ruleFilters: IAPIRuleFilter[];
  permitRequirementType: IAPIPermitRequirementType;
}

export interface IAPIPermitExceptionRuleRequest extends IBaseApiResponse {
  permitRequirementTypeId: number;
  ruleFilters: IAPIRuleRequest[];
}

interface IAPIPermitRequirementType extends IBaseApiResponse {
  permitRequirementTypeId: number;
}