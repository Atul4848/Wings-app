import { Airports } from '../../Models';
import { IAPIAirport } from '../API-airport.interface';
import { IAPISettingBase } from '../IAPI-SettingBase.interface';
import { IAPIResponseVendorLocationDocument } from './API-Response-VendorLocation';

export interface IAPIResponseVendorLocationOperationalEssential {
  createdBy: string;
  modifiedBy: string;
  createdOn: string;
  modifiedOn: string;
  id: number;
  coordinatingOffice: IAPIResponseVendorLocationDocument;
  isSupervisoryAgentAvailable: boolean;
  agentDispatchedFrom: Airports;
  isPrincipleOffice: boolean;
  vendorLevel: IAPISettingBase;
  certifiedMemberFeeSchedule: IAPISettingBase;
  certifiedMemberFee: number;
  contractRenewalDate: Date;
  complianceDiligenceDueDate: Date;
  startDate: Date;
  endDate: Date;
  isProprietary: boolean;
  netSuitId: number;
  creditProvidedBy: IAPIResponseVendorLocationDocument;
  locationAirfield: string;
  airToGroundFrequency: number;
  managerName: string;
  asstManagerName: string;
  appliedOperationType: IAPIResponseAppliedOperationType[];
  provideCoordinationFor: IAPIResponseProvideCoordinationFor[];
  commsCopyFor: IAPIResponseProvideCoordinationFor[];
  customers: IAPIResponseCustomers[];
  appliedPaymentOptions: IAPIResponseAppliedPaymentOptions[];
  appliedCreditAvailable: IAPIResponseAppliedCreditAvailable[];
  creditProvidedFor: IAPIResponseProvideCoordinationFor[];
  appliedMainServicesOffered: IAPIResponseAppliedMainServicesOffered[];
}

export interface IAPIResponseAppliedOperationType {
  id: number;
  operationalEssentialId: number;
  operationType: IAPISettingBase;
}

export interface IAPIResponseCustomers {
  id: number;
  operationalEssentialId: number;
  customerId: number;
  name: string;
  number: string;
}

export interface IAPIResponseProvideCoordinationFor {
  id: number;
  operationalEssentialId: number;
  vendorLocation: IAPIResponseVendorLocationDocument;
}

export interface IAPIResponseAppliedPaymentOptions {
  id: number;
  operationalEssentialId: number;
  paymentOptions: IAPISettingBase;
}

export interface IAPIResponseAppliedCreditAvailable {
  id: number;
  operationalEssentialId: number;
  creditAvailable: IAPISettingBase;
}

export interface IAPIResponseAppliedMainServicesOffered {
  id: number;
  operationalEssentialId: number;
  mainServicesOffered: IAPISettingBase;
}
