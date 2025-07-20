import { IBaseApiResponse, ISelectOption } from '@wings-shared/core';

export interface IAPIConditionTypeConfig extends IBaseApiResponse {
  conditionTypeId?: number;
  isDropDown: boolean;
  apiSource: string;
  conditionValueType: string;
  conditionType?:IBaseApiResponse
}
