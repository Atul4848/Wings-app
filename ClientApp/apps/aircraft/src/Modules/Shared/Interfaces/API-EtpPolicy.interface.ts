import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIEtpPolicy extends IBaseApiResponse {
  code: string;
  description: string;
  comments: string;
  etpScenarioIds: number[];
  etpScenarios?: IAPIEtpScenarioResponse[];
}

interface IAPIEtpScenarioResponse extends IBaseApiResponse {
  etpScenarioId: number;
  etpScenarioNumber: number;
}
