import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPICustom extends IBaseApiResponse {
  isAlcoholClearanceAllowed: boolean;
  allowableAlcoholClearance: number;
  isDisinsectionRequired: boolean;
  isAPISRequired: boolean;
  apisSubmissionAddress: string;
  apisFormat: string;
  declarationRequiredForCash: number;
  isWeaponsOnBoardAllowed: boolean;
  isAllDisinsectionDeparture: boolean;
  isDisinfectionRequired: boolean;
  isDocumentationRequired: boolean;
  formURL: string;
  country: IAPICustomCountry;
  apisSubmission: IAPIsSubmission;
  declarationRequiredForCashCurrency: IAPIDeclarationRequiredForCashCurrency;
  weaponsOnBoardRequiredDocuments: IAPIWeaponsOnBoardRequiredDocuments[];
  weaponOnBoardVendors: IAPIWeaponOnBoardVendors[];
  appliedDisinsectionDepartureCountries: IAPIAppliedDisinsectionDepartureCountries[];
  appliedWeaponInformations: IAPIAppliedWeaponInformations[];
  appliedDisinsectionTypes: IAPIAppliedDisinsectionTypes[];
  appliedDisinsectionChemicals: IAPIAppliedDisinsectionChemicals[];
  appliedAPISRequirements: IAPIAppliedAPISRequirements[];
}

export interface IAPICustomCountry extends IBaseApiResponse {
  countryId: number;
  code: string;
}

export interface IAPIsSubmission extends IBaseApiResponse {
  apisSubmissionId: number;
}

export interface IAPIDeclarationRequiredForCashCurrency extends IBaseApiResponse {
  declarationRequiredForCashCurrencyId: number;
}

export interface IAPIWeaponsOnBoardRequiredDocuments extends IBaseApiResponse {
  weaponsOnBoardRequiredDocumentId: number;
  permitDocumentId: number;
  code: string;
}

export interface IAPIWeaponOnBoardVendors extends IBaseApiResponse {
  weaponOnBoardVendorId: number;
  vendorId: number;
  code: string;
}

export interface IAPIAppliedDisinsectionDepartureCountries extends IBaseApiResponse {
  appliedDisinsectionDepartureCountryId: number;
  country: IAPICustomCountry;
}

export interface IAPIAppliedWeaponInformations extends IBaseApiResponse {
  appliedWeaponInformationId: number;
  weaponInformation: IAPIWeaponInformation;
}

export interface IAPIWeaponInformation extends IBaseApiResponse {
  weaponInformationId: number;
}

export interface IAPIAppliedDisinsectionTypes extends IBaseApiResponse {
  appliedDisinsectionTypeId: number;
  disinsectionType: IAPIDisinsectionType;
}

export interface IAPIDisinsectionType extends IBaseApiResponse {
  disinsectionTypeId: number;
  description: string;
}

export interface IAPIAppliedDisinsectionChemicals extends IBaseApiResponse {
  appliedDisinsectionChemicalId: number;
  disinsectionChemical: IAPIDisinsectionChemical;
}

export interface IAPIDisinsectionChemical extends IBaseApiResponse {
  disinsectionChemicalId: number;
}

export interface IAPIAppliedAPISRequirements extends IBaseApiResponse {
  appliedAPISRequirementId: number;
  apisRequirement: IAPIsRequirement;
}

export interface IAPIsRequirement extends IBaseApiResponse {
  apisRequirementId: number;
}
