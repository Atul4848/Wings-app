import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIIntlCustomsDetails extends IBaseApiResponse {
  internationalCustomsInformationId?: number;
  airportId: number;
  vipProcessingAvailable: boolean;
  overtimeAllowed: boolean;
  overtimeRequirements: string;
  taxRefundAvailable: boolean;
  taxRefundInstructions: string;
  cargoClearanceAvailable: boolean;
  quarantineOrImmigrationInformation: IQuarantineOrImmigrationInfo;
  feeInformation: IFeeInformation;
}

export interface IQuarantineOrImmigrationInfo {
  id: number;
  quarantineOrImmigrationInformationId?: number;
  agricultureOrQuarantineAvailable: boolean;
  agricultureOrQuarantineInstructions: string;
  immigrationAvailableAtAirport: boolean;
  immigrationInstructions: string;
}

export interface IFeeInformation {
  id: number;
  feeInformationId?: number;
  customsFeesApply: boolean;
  overtimeFeesApply: boolean;
  cashAccepted: boolean;
}
