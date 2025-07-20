import { VIEW_MODE, CountryModel, useBaseUpsertComponent } from '@wings/shared';
import { NavigateFunction, useParams } from 'react-router';
import {
  EntryRequirementModel,
  HealthAuthModel,
  HealthAuthStore,
  SettingsStore,
  VACCINE_PRIVILEGE,
} from '../../../Shared';
import { fields } from './Fields';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { IClasses, Utilities, SettingsTypeModel, baseEntitySearchFilters } from '@wings-shared/core';
import { useState } from 'react';

export interface BaseProps {
  classes?: IClasses;
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
  viewMode?: VIEW_MODE;
  params?: { viewMode: VIEW_MODE; id: number };
  navigate?: NavigateFunction;
}

const useEntryRequirementBase = ({ ...props }) => {
  const [ isRowEditing, setIsRowEditing ] = useState<boolean>(false);
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields, baseEntitySearchFilters);
  const healthAuth = props.healthAuthStore?.selectedHealthAuth as HealthAuthModel;
  const healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const settingsStore = props.settingsStore as SettingsStore;

  const setFormValidation = (prefix: string = ''): void => {
    if (Utilities.isEqual(prefix, 'crewEntryRequirement')) {
      setCrewRequirementValidations(useUpsert.form.values()?.crewEntryRequirement);
      return;
    }
    if (Utilities.isEqual(prefix, 'passengerEntryRequirement')) {
      setPassengerRequirementValidations(useUpsert.form.values()?.passengerEntryRequirement);
      return;
    }
    const { selectedHealthAuth } = healthAuthStore as HealthAuthStore;
    const { crewEntryRequirement, passengerEntryRequirement } = selectedHealthAuth;
    setCrewRequirementValidations(crewEntryRequirement);
    setPassengerRequirementValidations(passengerEntryRequirement);
  };

  const setCrewRequirementValidations = (crewEntryRequirement): void => {
    setPreTravelTestValidation('crewEntryRequirement', crewEntryRequirement.isPreTravelTestRequired);
    setFormRequirementValidations('crewEntryRequirement', crewEntryRequirement.isFormsRequired);
  };

  const setPassengerRequirementValidations = (passengerEntryRequirement): void => {
    setPreTravelTestValidation('passengerEntryRequirement', passengerEntryRequirement.isPreTravelTestRequired);
    setFormRequirementValidations('passengerEntryRequirement', passengerEntryRequirement.isFormsRequired);
  };

  const setVaccineExemptionValues = (): void => {
    setCrewExemptionValues();
    setPassengerVaccineExemption();
  };

  const setCrewExemptionValues = (): void => {
    const { vaccinePrivileges } = healthAuth?.crewVaccinationRequirement;
    const isEntryPreArrival: boolean = vaccinePrivileges.some(
      x => x.name === VACCINE_PRIVILEGE.ENTRY_PRE_ARRIVAL_TEST_EXEMPTION
    );
    const isEntryTestArrival: boolean = vaccinePrivileges.some(
      x => x.name === VACCINE_PRIVILEGE.ENTRY_TEST_ON_ARRIVAL_EXEMPTION
    );
    useUpsert
      .getField('crewEntryRequirement.preTravelTestEntryRequirement.isPreTravelTestVaccineExemption')
      .set(isEntryPreArrival);
    useUpsert
      .getField('crewEntryRequirement.arrivalTestEntryRequirement.isArrivalTestVaccineExemption')
      .set(isEntryTestArrival);
  };

  const setPassengerVaccineExemption = (): void => {
    const { vaccinePrivileges } = healthAuth?.passengerVaccinationRequirement;
    const isEntryPreArrival: boolean = vaccinePrivileges.some(
      x => x.name === VACCINE_PRIVILEGE.ENTRY_PRE_ARRIVAL_TEST_EXEMPTION
    );
    const isEntryTestArrival: boolean = vaccinePrivileges.some(
      x => x.name === VACCINE_PRIVILEGE.ENTRY_TEST_ON_ARRIVAL_EXEMPTION
    );
    useUpsert
      .getField('passengerEntryRequirement.preTravelTestEntryRequirement.isPreTravelTestVaccineExemption')
      .set(isEntryPreArrival);
    useUpsert
      .getField('passengerEntryRequirement.arrivalTestEntryRequirement.isArrivalTestVaccineExemption')
      .set(isEntryTestArrival);
  };

  const resetEntryRequirement = (entity: string, isEntryRequirements: boolean): void => {
    const isCrew: boolean = Utilities.isEqual(entity, 'crewEntryRequirement');
    const formValues: HealthAuthModel = useUpsert.form.values();
    const paxCrew = new SettingsTypeModel({ id: isCrew ? 2 : 1 });
    const model = new EntryRequirementModel({ paxCrew, isEntryRequirements });
    if (isCrew) {
      formValues.crewEntryRequirement = model;
      useUpsert.setFormValues(formValues);
      setVaccineExemptionValues();

      return;
    }
    formValues.passengerEntryRequirement = model;
    useUpsert.setFormValues(formValues);
    setVaccineExemptionValues();
  };

  const setFormRequirementValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.formRequirements`, required, 'Form Requirements');
  };

  const setPreTravelTestValidation = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.preTravelTestEntryRequirement.testType`, false, 'Type of Test');
    if (!required) {
      useUpsert.getField(`${prefix}.preTravelTestEntryRequirement.testType`).set(null);
    }
  };

  /* istanbul ignore next */
  const groupInputContols = (): IGroupInputControls[] => {
    return [
      {
        title: 'Crew Entry Requirement',
        inputControls: [
          {
            fieldKey: 'crewEntryRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isFullFlex: true,
            isHidden: !Boolean(healthAuth.parentId),
            isDisabled: isRowEditing,
          },
          {
            fieldKey: 'crewEntryRequirement.isEntryRequirements',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.entryRequirementBannedNationalitiesRegions',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isCrewRequirementRequired(),
            options: props.healthAuthStore?.regions,
            multiple: true,
            isDisabled: isCrewEntryInherited() || useUpsert.isLoading,
          },
          {
            fieldKey: 'crewEntryRequirement.entryRequirementBannedNationalities',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isCrewRequirementRequired(),
            options: props.healthAuthStore?.countries,
            multiple: true,
            getChipLabel: option => (option as CountryModel).isO2Code,
            isDisabled: isCrewEntryInherited(),
            getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
            showChipTooltip: true,
          },
          {
            fieldKey: 'crewEntryRequirement.isPreApprovalRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.preApprovalEntryRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Hrs',
            isHidden: isCrewRequirementRequired() || isCrewPreApprovalRequired(),
            isHalfFlex: true,
            isIndent: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.preApprovalEntryRequirement.landingPermitImplications',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired() || isCrewPreApprovalRequired(),
            isHalfFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isPreTravelTestRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.preTravelTestEntryRequirement.isPreTravelTestVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.preTravelTestEntryRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Hrs',
            isHidden: isCrewRequirementRequired() || isCrewPreTravelTestRequired(),
            isIndent: true,
          },
          {
            fieldKey: 'crewEntryRequirement.preTravelTestEntryRequirement.leadTimeIndicator',
            type: EDITOR_TYPES.DROPDOWN,
            options: settingsStore.leadTimeIndicators,
            isHidden: isCrewRequirementRequired() || isCrewPreTravelTestRequired(),
          },
          {
            fieldKey: 'crewEntryRequirement.preTravelTestEntryRequirement.isProofRequiredBeforeBoarding',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired() || isCrewPreTravelTestRequired(),
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.preTravelTestEntryRequirement.testType',
            type: EDITOR_TYPES.DROPDOWN,
            options: settingsStore.testTypes,
            isHidden: isCrewRequirementRequired() || isCrewPreTravelTestRequired(),
            isIndent: true,
          },
          {
            fieldKey: 'crewEntryRequirement.preTravelTestEntryRequirement.consequences',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired() || isCrewPreTravelTestRequired(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.preTravelTestEntryRequirement.preTravelTestDetails',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            isHidden: isCrewRequirementRequired() || isCrewPreTravelTestRequired(),
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isTestRequiredOnArrival',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.arrivalTestEntryRequirement.isArrivalTestVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isHealthScreeningOnArrival',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isRandomScreeningTestingPossible',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isFormsRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.formRequirements',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            isHidden: isCrewRequirementRequired() || isCrewFormsRequired(),
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isStayContactInfoRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isHotelPreBookingRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isSymptomaticUponArrivalRequirements',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.symptomaticUponArrivalRequirements',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired() || isCrewSymptomaticUponArrivalRequirements(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.isHealthInsuranceRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.typeOfHealthInsuranceRequired',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired() || crewIsHealthInsuranceRequired(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
            isDisabled: isCrewEntryInherited(),
          },
          {
            fieldKey: 'crewEntryRequirement.ageExemption',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired(),
            isDisabled: true,
          },
          {
            fieldKey: 'crewEntryRequirement.covidRecoveredPassengerExemption',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewEntryInherited(),
            multiline: true,
            rows: 5,
            isFullFlex: true,
          },
          {
            fieldKey: 'crewEntryRequirement.extraInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isCrewEntryInherited(),
          },
        ],
      },
      {
        title: 'Passenger Entry Requirement',
        inputControls: [
          {
            fieldKey: 'passengerEntryRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isFullFlex: true,
            isHidden: !Boolean(healthAuth.parentId),
            isDisabled: isRowEditing,
          },
          {
            fieldKey: 'passengerEntryRequirement.isEntryRequirements',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.entryRequirementBannedNationalitiesRegions',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isPassengerRequirementRequired(),
            options: props.healthAuthStore?.regions,
            multiple: true,
            isDisabled: isPassengerInherited() || useUpsert.isLoading,
          },
          {
            fieldKey: 'passengerEntryRequirement.entryRequirementBannedNationalities',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isPassengerRequirementRequired(),
            options: props.healthAuthStore?.countries,
            multiple: true,
            getChipLabel: option => (option as CountryModel).isO2Code,
            isDisabled: isPassengerInherited(),
            getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
            showChipTooltip: true,
          },
          {
            fieldKey: 'passengerEntryRequirement.isPreApprovalRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.preApprovalEntryRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Hrs',
            isHidden: isPassengerRequirementRequired() || isPassengerPreApprovalRequired(),
            isHalfFlex: true,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.preApprovalEntryRequirement.landingPermitImplications',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired() || isPassengerPreApprovalRequired(),
            isHalfFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isPreTravelTestRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.preTravelTestEntryRequirement.isPreTravelTestVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.preTravelTestEntryRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Hrs',
            isHidden: isPassengerRequirementRequired() || isPassengerPreTravelTestRequired(),
            isIndent: true,
          },
          {
            fieldKey: 'passengerEntryRequirement.preTravelTestEntryRequirement.leadTimeIndicator',
            type: EDITOR_TYPES.DROPDOWN,
            options: settingsStore.leadTimeIndicators,
            isHidden: isPassengerRequirementRequired() || isPassengerPreTravelTestRequired(),
          },
          {
            fieldKey: 'passengerEntryRequirement.preTravelTestEntryRequirement.isProofRequiredBeforeBoarding',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired() || isPassengerPreTravelTestRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.preTravelTestEntryRequirement.testType',
            type: EDITOR_TYPES.DROPDOWN,
            options: settingsStore.testTypes,
            isHidden: isPassengerRequirementRequired() || isPassengerPreTravelTestRequired(),
            isIndent: true,
          },
          {
            fieldKey: 'passengerEntryRequirement.preTravelTestEntryRequirement.consequences',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired() || isPassengerPreTravelTestRequired(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.preTravelTestEntryRequirement.preTravelTestDetails',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            isHidden: isPassengerRequirementRequired() || isPassengerPreTravelTestRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isTestRequiredOnArrival',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.arrivalTestEntryRequirement.isArrivalTestVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isHealthScreeningOnArrival',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isRandomScreeningTestingPossible',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isFormsRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.formRequirements',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            isHidden: isPassengerRequirementRequired() || isPassengerFormsRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isStayContactInfoRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isHotelPreBookingRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isSymptomaticUponArrivalRequirements',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.symptomaticUponArrivalRequirements',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired() || isPassengerSymptomaticUponArrivalRequirements(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.isHealthInsuranceRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.typeOfHealthInsuranceRequired',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired() || passengerIsHealthInsuranceRequired(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.ageExemption',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerEntryRequirement.covidRecoveredPassengerExemption',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerInherited(),
            multiline: true,
            rows: 5,
            isFullFlex: true,
          },
          {
            fieldKey: 'passengerEntryRequirement.extraInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isPassengerInherited(),
          },
        ],
      },
    ];
  };

  const isCrewEntryInherited = (): boolean => Boolean(useUpsert.getField('crewEntryRequirement.isInherited')?.value);

  const isPassengerInherited = (): boolean =>
    Boolean(useUpsert.getField('passengerEntryRequirement.isInherited')?.value);

  const isCrewRequirementRequired = (): boolean =>
    !useUpsert.getField('crewEntryRequirement.isEntryRequirements')?.value;

  const isCrewPreApprovalRequired = (): boolean =>
    !useUpsert.getField('crewEntryRequirement.isPreApprovalRequired')?.value;

  const isCrewPreTravelTestRequired = (): boolean =>
    !useUpsert.getField('crewEntryRequirement.isPreTravelTestRequired')?.value;

  const isCrewSymptomaticUponArrivalRequirements = (): boolean =>
    !useUpsert.getField('crewEntryRequirement.isSymptomaticUponArrivalRequirements')?.value;

  const crewIsHealthInsuranceRequired = (): boolean =>
    !useUpsert.getField('crewEntryRequirement.isHealthInsuranceRequired')?.value;

  const isCrewFormsRequired = (): boolean => !useUpsert.getField('crewEntryRequirement.isFormsRequired')?.value;

  const isPassengerRequirementRequired = (): boolean =>
    !useUpsert.getField('passengerEntryRequirement.isEntryRequirements')?.value;

  const isPassengerPreApprovalRequired = (): boolean =>
    !useUpsert.getField('passengerEntryRequirement.isPreApprovalRequired')?.value;

  const isPassengerPreTravelTestRequired = (): boolean =>
    !useUpsert.getField('passengerEntryRequirement.isPreTravelTestRequired')?.value;

  const isPassengerSymptomaticUponArrivalRequirements = (): boolean =>
    !useUpsert.getField('passengerEntryRequirement.isSymptomaticUponArrivalRequirements')?.value;

  const passengerIsHealthInsuranceRequired = (): boolean =>
    !useUpsert.getField('passengerEntryRequirement.isHealthInsuranceRequired')?.value;

  const isPassengerFormsRequired = (): boolean =>
    !useUpsert.getField('passengerEntryRequirement.isFormsRequired')?.value;
  return {
    useUpsert,
    params,
    groupInputContols,
    healthAuth,
    setFormValidation,
    setVaccineExemptionValues,
    setFormRequirementValidations,
    isRowEditing,
    setIsRowEditing,
    healthAuthStore,
    settingsStore,
    setPreTravelTestValidation,
    resetEntryRequirement
  };
};

export default useEntryRequirementBase;
