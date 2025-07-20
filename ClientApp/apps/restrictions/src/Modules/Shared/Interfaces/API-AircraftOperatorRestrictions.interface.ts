import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPIAircraftOperatorRestrictions extends IAPIAircraftOperatorRestrictionsRequest {
  aircraftOperatorRestrictionId: number;
  effectedEntityType?: IEffectedEntityType;
  effectedEntity?: IEffectedEntity;
  nationalities: INationality[];
  aircraftOperatorRestrictionType: IAircraftOperatorRestrictionType;
  restrictionSource: IRestrictionSource;
  restrictingCountry: IRestrictingCountry;
  enforcementAgency: IEnforcementAgency;
  restrictionSeverity: IRestrictionSeverity;
  approvalTypeRequired: IApprovalTypeRequired;
  uwaAllowableAction: IUwaAllowableAction;
}

export interface IAPIAircraftOperatorRestrictionsRequest extends IBaseApiResponse {
  startDate: string;
  endDate: string;
  effectedEntityTypeId: number;
  effectedEntityId: number;
  effectedEntityCode: string;
  effectedEntityName: string;
  aircraftOperatorRestrictionTypeId: number;
  restrictionAppliedToOperators: boolean;
  restrictionAppliedToPassportedPassenger: boolean;
  restrictionAppliedToLicenseHolder: boolean;
  restrictionAppliedToRegistries: boolean;
  restrictionAppliedToAllFlights: boolean;
  exceptForeignOperators: boolean;
  sfc: boolean;
  unl: boolean;
  lowerLimitFL: number;
  upperLimitFL: number;
  restrictionSourceId: number;
  restrictingCountryId: number;
  restrictingCountryCode: string;
  restrictingCountryName: string;
  restrictionSeverityId: number;
  approvalTypeRequiredId: number;
  uwaAllowableActionId: number;
  enforcementAgencyId: number;
  notamid: string;
  notamExpiryDate: string;
  link: string;
  summary?: string;
  aircraftOperatorRestrictionForms: IAircraftOperatorRestrictionForm[];
  nationalities: INationality[];
  aircraftOperatorRestrictionUWAAllowableServices: IUWAAllowableServices[];
}

interface IEffectedEntityType extends IBaseApiResponse {
  effectedEntityTypeId?: number;
}

interface IEffectedEntity extends IBaseApiResponse {
  code: string;
  effectedEntityId?: number;
}

interface INationality {
  name: string;
  code: string;
  nationalityId: number;
  countryId: number;
}

interface IRestrictionSource extends IBaseApiResponse {
  restrictionSourceId?: number;
}

interface IRestrictionSeverity extends IBaseApiResponse {
  restrictionSeverityId?: number;
}

interface IApprovalTypeRequired extends IBaseApiResponse {
  approvalTypeRequiredId?: number;
}

interface IRestrictingCountry extends IBaseApiResponse {
  code: string;
  restrictingCountryId?: number;
}

interface IEnforcementAgency extends IBaseApiResponse {
  enforcementAgencyId?: number;
}

interface IAircraftOperatorRestrictionType extends IBaseApiResponse {
  aircraftOperatorRestrictionTypeId?: number;
}

interface IAircraftOperatorRestrictionForm {
  aircraftOperatorRestrictionFormId?: number;
  restrictionFormId: number;
  restrictionForm?: IRestrictionForm;
}

interface IRestrictionForm extends IBaseApiResponse {
  restrictionFormId: number;
}

interface IUwaAllowableAction extends IBaseApiResponse {
  uwaAllowableActionId?: number;
}

interface IUWAAllowableServices {
  aircraftOperatorRestrictionUWAAllowableServiceId?: number;
  uwaAllowableServiceId: number;
  uwaAllowableService?: IAllowableService;
}

interface IAllowableService extends IBaseApiResponse {
  uwaAllowableServiceId: number;
}
