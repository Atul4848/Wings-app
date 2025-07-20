import { EntityMapModel } from '@wings-shared/core';
import moment from 'moment';

export const generalFields = {
  charterMaxLiquidInML: {
    label: 'Charter Liquid Max (ml)*',
    rules: 'required|numeric|min:1',
  },
  isMedicalInsuranceRecommended: {
    label: 'Medical Insurance Recommended',
  },
  navigators: {
    label: 'Navigators',
    value: [],
  },
  fullAviationSecurityCheckRqrdOnDepartures: {
    label: 'Full Aviation Security Check Required on Departure',
    value: [],
  },
  domesticCountries: {
    label: 'Domestic Countries',
    value: [],
  },
  businessDays: {
    label: 'Business Days',
    value: [],
  },
};

export const cabotageFields = {
  isCabotageEnforced: {
    label: 'Cabotage Enforced',
  },
  exemptionLevel: {
    label: 'Cabotage Level',
  },
  cabotageAssociatedEntities: {
    label: 'Cabotage Associated Entities',
    value: [],
  },
  isImportationFeesforDomesticFlight: {
    label: 'Importation Fees for Domestic Flights',
  },
  cabotageEnforcedForFARTypes: {
    label: 'Cabotage Enforced for FAR Type',
    value: [],
  },
  isCustomsStopsExempt: {
    label: 'Customs Stops Exempt',
  },
  isPaxMustDepartwithSameOperator: {
    label: 'Pax Must Depart with Same Operator',
  },
  isNoNewPaxAllowedtoDepart: {
    label: 'No New Pax Allowed to Depart',
  },
  isCabotageAppliestoLivestock: {
    label: 'Cabotage Applies to Livestock',
  },
  isCabotageAppliestoCargo: {
    label: 'Cabotage Applies to Cargo',
  },
  isCabotageAppliestoNonResidents: {
    label: 'Cabotage Applies to Non-Residents',
  },
};

export const flightPlanningFields = {
  acasiiEquippedTCASVersion: {
    label: 'ACAS II Equipped TCAS Version',
    rules: 'string|between:1,10',
  },
  tcasRqrdFL: {
    label: 'TCAS Required at or Below FL',
    rules: 'numeric|min:0|max:999',
  },
  rvsmSeparationMin: {
    label: 'RVSM Separation',
    rules: 'numeric|min:0|max:9999',
  },
  rvsmLowerFL: {
    label: 'RVSM Lower FL',
    rules: 'numeric|min:0|max:999',
  },
  rvsmUpperFL: {
    label: 'RVSM Upper FL',
    rules: 'numeric|min:0|max:999',
  },
  rvsmItem10: {
    label: 'RVSM Item 10',
  },
  is833KHzChnlSpaceRqrd: {
    label: '8.33 KHz Channel Spacing',
  },
  adsbRqrdAboveFL: {
    label: 'ADS-B Required above FL',
    rules: 'numeric|min:0|max:999',
  },
  acasiIdataIsRqrd: {
    label: 'ACAS II data',
  },
  acasiiOrTCAS: {
    label: 'ACAS II / TCAS',
    value: [],
  },
  rvsmComplianceExceptions: {
    label: 'RVSM Compliance Exceptions',
    value: [],
  },
  bannedAircrafts: {
    label: 'Banned Aircraft',
    value: [],
  },
  noiseRestrictedAircrafts: {
    label: 'Noise Restricted Aircraft',
    value: [],
  },
  documentsRequiredforFilings: {
    label: 'Documents Required for Filing',
    value: [],
  },
  appliedItem18Contents: {
    label: 'Item 18 Contents',
    value: [],
  },
  appliedRequiredAircraftEquipments: {
    label: 'Aircraft Equipment',
    value: [],
  },
  acasiiAdditionalInformations: {
    value: [],
  },
};

export const customFields = {
  isAlcoholClearanceAllowed: {
    label: 'Alcohol Clearance Allowed',
  },
  allowableAlcoholClearance: {
    label: 'Allowable Alcohol Clearance (liters)',
    rules: 'integer|max:99',
  },
  isDisinsectionRequired: {
    label: 'Disinsection',
  },
  appliedDisinsectionDepartureCountries: {
    label: 'Disinsection Departure Country',
  },
  appliedDisinsectionTypes: {
    label: 'Disinsection Required Types',
  },
  appliedDisinsectionChemicals: {
    label: 'Disinsection Chemicals',
  },
  isAPISRequired: {
    label: 'APIs Required',
  },
  appliedAPISRequirements: {
    label: 'APIs Requirements',
  },
  apisSubmission: {
    label: 'APIS Submission Method',
  },
  apisSubmissionAddress: {
    label: 'APIS Submission Address',
    rules: 'string|between:1,200',
  },
  apisFormat: {
    label: 'APIS Format',
    rules: 'string|between:1,2000|url',
  },
  isWeaponsOnBoardAllowed: {
    label: 'Weapons Onboard Required',
  },
  weaponsOnBoardRequiredDocuments: {
    label: 'Weapons on Board Required Documents',
  },
  appliedWeaponInformations: {
    label: 'Weapons Information Vendor',
  },
  weaponOnBoardVendors: {
    label: 'Weapons on Board Vendor',
  },
  declarationRequiredForCash: {
    label: 'Declaration required for cash',
    rules: 'integer',
  },
  declarationRequiredForCashCurrency: {
    label: 'Declaration required for cash currency',
  },
  isAllDisinsectionDeparture: {
    label: 'Disinsection All Countries',
  },
  isDisinfectionRequired: {
    label: 'Disinfection Required',
  },
  isDocumentationRequired: {
    label: 'Documentation Required',
  },
  formURL: {
    label: 'Form Link',
    rules: 'string|between:1,1024',
  },
};

export const weekOptions = () => {
  return moment.weekdays().map((name: string, index: number) => new EntityMapModel({ name, entityId: index + 1 }));
};
