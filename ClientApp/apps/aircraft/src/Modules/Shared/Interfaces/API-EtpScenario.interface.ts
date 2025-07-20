import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpScenario extends IBaseApiResponse {
  etpScenarioNumber: number;
  nfpScenarioNumber: number;
  description: string;
  comments: string;
  extRangeEntryPointRadius: number;
  etpScenarioTypeId: number;
  etpScenarioEngineId: number;
  weightUOMId: number;
  etpTimeLimitTypeId: number;
  etpScenarioType?: IAPIEtpScenarioEngineType;
  etpScenarioEngine?: IAPIEtpScenarioEngine;
  etpTimeLimitType?: IAPIEtpTimeLimitType;
  weightUOM?: IAPIWeightUom;
}

interface IAPIEtpScenarioEngineType extends IBaseApiResponse {
  etpScenarioTypeId: number;
}

interface IAPIEtpScenarioEngine extends IBaseApiResponse {
  etpScenarioEngineId: number;
}

interface IAPIEtpTimeLimitType extends IBaseApiResponse {
  etpTimeLimitTypeId: number;
}

interface IAPIWeightUom extends IBaseApiResponse {
  weightUOMId: number;
}
