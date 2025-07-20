import { IBaseApiResponse } from '@wings-shared/core';
import { PERMIT_RULE_SOURCES } from '..';

export interface IAPIRuleEntityParameterConfig extends IBaseApiResponse {
  ruleEntityType: IBaseApiResponse;
  entityParameter: string;
  isDropDown: boolean;
  apiSource: PERMIT_RULE_SOURCES;
  entityParameterType: string;
  supportedOperators: IBaseApiResponse[];
}
