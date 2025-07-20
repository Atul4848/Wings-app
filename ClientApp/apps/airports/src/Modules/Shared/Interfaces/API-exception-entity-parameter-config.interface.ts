import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIExceptionEntityParameterConfig extends IBaseApiResponse {
  exceptionEntityTypeId?: number;
  isDropDown: boolean;
  apiSource: string;
  entityParameter: string;
  entityParameterType: string;
  supportedOperators?: IAPIOperators[];
  exceptionEntityType?: IAPIExceptionEntityType;
}

interface IAPIExceptionEntityType extends IBaseApiResponse {
  exceptionEntityTypeId?: number;
}

interface IAPIOperators extends IBaseApiResponse {
  exceptionConditionalOperatorId?: number;
}
