import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIRuleValue extends IBaseApiResponse {
  tempId?: number;
  code: string;
  ruleValue: string | number;
  ruleFilterValueId?: number;
  toolTip?: string;
}
