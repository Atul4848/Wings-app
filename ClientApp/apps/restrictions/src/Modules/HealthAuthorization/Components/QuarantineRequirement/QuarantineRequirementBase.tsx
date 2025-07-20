import { VIEW_MODE, CountryModel, useBaseUpsertComponent } from '@wings/shared';
import { fields } from './Fields';
import { HealthAuthStore, HealthAuthModel } from '../../../Shared';
import { IClasses, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router';

export interface BaseProps {
  classes?: IClasses;
  healthAuthStore?: HealthAuthStore;
  viewMode?: VIEW_MODE;
}

const useQuarantineRequirementBase = ({ ...props }) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields, baseEntitySearchFilters);
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const [ healthAuthorization, setHealthAuthorization ] = useState<HealthAuthModel>(
    new HealthAuthModel(_healthAuthStore?.selectedHealthAuth)
  );

  useEffect(() => {
    useUpsert.setViewMode((params.viewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.DETAILS);
  }, []);

  const setFormValidations = (prefix: string = ''): void => {
    if (Utilities.isEqual(prefix, 'crewQuarantineRequirement')) {
      setCrewQuarantineValidations(useUpsert.form.values()?.crewQuarantineRequirement);
      return;
    }
    if (Utilities.isEqual(prefix, 'passengerQuarantineRequirement')) {
      setPassengerQuarantineValidations(useUpsert.form.values()?.passengerQuarantineRequirement);
      return;
    }
    const { crewQuarantineRequirement, passengerQuarantineRequirement } = healthAuthorization;
    setCrewQuarantineValidations(crewQuarantineRequirement);
    setPassengerQuarantineValidations(passengerQuarantineRequirement);
  };

  const setCrewQuarantineValidations = crewQuarantineRequirement => {
    setTravelHistoryValidations('crewQuarantineRequirement', crewQuarantineRequirement.isTravelHistoryBased);
    setQuarantineLocationsValidations('crewQuarantineRequirement', crewQuarantineRequirement.isLocationAllowed);
    setQuarantinePeriodValidations('crewQuarantineRequirement', crewQuarantineRequirement.isPeriodOfQuarantineRequired);
    setMonitoringMethodValidations('crewQuarantineRequirement', crewQuarantineRequirement.isGovtSelfMonitoringRequired);
    setTestInformatiOnValidations('crewQuarantineRequirement', crewQuarantineRequirement.isTestExemption);
  };

  const setPassengerQuarantineValidations = (passengerQuarantineRequirement): void => {
    setTravelHistoryValidations('passengerQuarantineRequirement', passengerQuarantineRequirement.isTravelHistoryBased);
    setQuarantineLocationsValidations(
      'passengerQuarantineRequirement',
      passengerQuarantineRequirement.isLocationAllowed
    );
    setQuarantinePeriodValidations(
      'passengerQuarantineRequirement',
      passengerQuarantineRequirement.isPeriodOfQuarantineRequired
    );
    setMonitoringMethodValidations(
      'passengerQuarantineRequirement',
      passengerQuarantineRequirement.isGovtSelfMonitoringRequired
    );
    setTestInformatiOnValidations('passengerQuarantineRequirement', passengerQuarantineRequirement.isTestExemption);
    setAgeExemptionValidations('passengerQuarantineRequirement', passengerQuarantineRequirement.isAgeExemption);
  };

  const setQuarantinePeriodValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.periodOfQuarantineRequired`, required, 'Period of Quarantine Required');
  };

  const setTestInformatiOnValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.testInformation`, required, 'Test Information');
  };

  const setAgeExemptionValidations = (prefix: string, required: boolean) => {
    useUpsert.setFormRules(`${prefix}.age`, required, 'Age Exemption');
    if (!required) {
      useUpsert.getField(`${prefix}.age`).set(null);
    }
  };

  const setMonitoringMethodValidations = (prefix: string, required: boolean) => {
    useUpsert.setFormRules(`${prefix}.monitoringMethod`, required, 'Monitoring Method');
  };

  const setQuarantineLocationsValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.quarantineLocations`, required, 'Locations');
  };

  const setTravelHistoryValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.quarantineTraveledCountries`, required, 'Traveled Countries');
    if (!required) {
      useUpsert.getField(`${prefix}.previousTimeFrame`).set(null);
    }
  };

  /* istanbul ignore next */
  const clearValidations = (prefix: string): void => {
    if (Utilities.isEqual(prefix, 'passengerQuarantineRequirement')) {
      groupInputContols()[1].inputControls.forEach(x => {
        useUpsert.setFormRules(x.fieldKey as string, false, x.label);
      });
      return;
    }
    groupInputContols()[0].inputControls.forEach(x => {
      useUpsert.setFormRules(x.fieldKey as string, false, x.label);
    });
  };

  /* istanbul ignore next */
  const groupInputContols = (): IGroupInputControls[] => {
    return [
      {
        title: 'Crew Quarantine Requirement',
        inputControls: [
          {
            fieldKey: 'crewQuarantineRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: !Boolean(healthAuthorization.parentId),
            isFullFlex: true,
          },
          {
            fieldKey: 'crewQuarantineRequirement.isQuarantineRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Quarantine Requirements',
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.isVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.isSymptomsBased',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Symptom Based',
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.isTravelHistoryBased',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Based on Travel History',
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.previousTimeFrame',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Previous Time Frame',
            endAdormentValue: 'Days',
            isHidden: isCrewRequirementRequired() || isCrewTravelHistoryBased(),
            isIndent: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.quarantineTraveledCountries',
            type: EDITOR_TYPES.DROPDOWN,
            isLoading: useUpsert.loader.isLoading,
            multiple: true,
            getChipLabel: option => (option as CountryModel).isO2Code,
            options: _healthAuthStore.countries,
            label: 'Traveled Countries',
            isHidden: isCrewRequirementRequired() || isCrewTravelHistoryBased(),
            isDisabled: isCrewQuarantineInherited(),
            getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
            showChipTooltip: true,
          },
          {
            fieldKey: 'crewQuarantineRequirement.isPeriodOfQuarantineRequired',
            type: EDITOR_TYPES.CHECKBOX,
            label: 'Period of Quarantine Required',
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.periodOfQuarantineRequired',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Period of Quarantine Required',
            endAdormentValue: 'Days',
            isHidden: isCrewRequirementRequired() || isCrewPeriodOfQuarantineRequired(),
            isIndent: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.isLengthOfStay',
            type: EDITOR_TYPES.CHECKBOX,
            label: 'or Length of Stay',
            isHidden: isCrewRequirementRequired() || isCrewPeriodOfQuarantineRequired(),
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.isLocationAllowed',
            type: EDITOR_TYPES.CHECKBOX,
            label: 'Where allowed to quarantine',
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.quarantineLocations',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            options: _healthAuthStore.quarantineLocations,
            label: 'Locations',
            isHidden: isCrewRequirementRequired() || isCrewLocationAllowed(),
            isHalfFlex: true,
            isIndent: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.isGovtSelfMonitoringRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Government Self Monitoring Required',
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.monitoringMethod',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Monitoring Method App or Site',
            isHidden: isCrewRequirementRequired() || isCrewGovtSelfMonitoringRequired(),
            isFullFlex: true,
            isIndent: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.isTestExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Test Exemptions',
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.testInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Test Information',
            isHidden: isCrewRequirementRequired() || isCrewTestExemption(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isIndent: true,
            isDisabled: isCrewQuarantineInherited(),
          },
          {
            fieldKey: 'crewQuarantineRequirement.testModifications',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Test Modifications',
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isCrewQuarantineInherited(),
          },
        ],
      },
      {
        title: 'Passenger Quarantine Requirement',
        inputControls: [
          {
            fieldKey: 'passengerQuarantineRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: !Boolean(healthAuthorization.parentId),
            isFullFlex: true,
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isQuarantineRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Quarantine Requirements',
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isSymptomsBased',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Symptom Based',
            isFullFlex: true,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isAgeExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Age Exemption',
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.age',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Age',
            isHidden: isPassengerRequirementRequired() || isAgeExemption(),
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isTravelHistoryBased',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Based on Travel History',
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.previousTimeFrame',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Previous Time Frame',
            endAdormentValue: 'Days',
            isHidden: isPassengerRequirementRequired() || isPassengerTravelHistoryBased(),
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.quarantineTraveledCountries',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            options: _healthAuthStore.countries,
            getChipLabel: option => (option as CountryModel).isO2Code,
            label: 'Traveled Countries',
            isHidden: isPassengerRequirementRequired() || isPassengerTravelHistoryBased(),
            isDisabled: isPassengerInherited(),
            getChipTooltip: option => (option as CountryModel).name || (option as CountryModel).isO2Code,
            showChipTooltip: true,
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isPeriodOfQuarantineRequired',
            type: EDITOR_TYPES.CHECKBOX,
            label: 'Period of Quarantine Required',
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.periodOfQuarantineRequired',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Period of Quarantine Required',
            endAdormentValue: 'Days',
            isHidden: isPassengerRequirementRequired() || isPassengerQuarantinePeriodRequired(),
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isLengthOfStay',
            type: EDITOR_TYPES.CHECKBOX,
            label: 'or Length of Stay',
            isHidden: isPassengerRequirementRequired() || isPassengerQuarantinePeriodRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isLocationAllowed',
            type: EDITOR_TYPES.CHECKBOX,
            label: 'Where allowed to quarantine',
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.quarantineLocations',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            isLoading: useUpsert.loader.isLoading,
            options: _healthAuthStore.quarantineLocations,
            label: 'Traveled Countries',
            isHidden: isPassengerRequirementRequired() || isPassengerLocationAllowed(),
            isHalfFlex: true,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isGovtSelfMonitoringRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Government Self Monitoring Required',
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.monitoringMethod',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Monitoring Method App or Site',
            isHidden: isPassengerRequirementRequired() || isPassengerGovtSelfMonitoringRequired(),
            isFullFlex: true,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.isTestExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Test Exemptions',
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.testInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Test Information',
            isHidden: isPassengerRequirementRequired() || isPassengerTestExemption(),
            isIndent: true,
            isFullFlex: true,
            multiline: true,
            rows: 5,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerQuarantineRequirement.testModifications',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Test Modifications',
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

  const isCrewQuarantineInherited = (): boolean => useUpsert.getField('crewQuarantineRequirement.isInherited')?.value;

  const isPassengerInherited = (): boolean => useUpsert.getField('passengerQuarantineRequirement.isInherited')?.value;

  const isCrewTravelHistoryBased = (): boolean =>
    !useUpsert.getField('crewQuarantineRequirement.isTravelHistoryBased')?.value;

  const isCrewPeriodOfQuarantineRequired = (): boolean =>
    !useUpsert.getField('crewQuarantineRequirement.isPeriodOfQuarantineRequired')?.value;

  const isPassengerQuarantinePeriodRequired = (): boolean =>
    !useUpsert.getField('passengerQuarantineRequirement.isPeriodOfQuarantineRequired')?.value;

  const isPassengerLocationAllowed = (): boolean =>
    !useUpsert.getField('passengerQuarantineRequirement.isLocationAllowed')?.value;

  const isCrewLocationAllowed = (): boolean =>
    !useUpsert.getField('crewQuarantineRequirement.isLocationAllowed')?.value;

  const isCrewGovtSelfMonitoringRequired = (): boolean =>
    !useUpsert.getField('crewQuarantineRequirement.isGovtSelfMonitoringRequired')?.value;

  const isCrewTestExemption = (): boolean => !useUpsert.getField('crewQuarantineRequirement.isTestExemption')?.value;

  const isPassengerTravelHistoryBased = (): boolean =>
    !useUpsert.getField('passengerQuarantineRequirement.isTravelHistoryBased')?.value;

  const isAgeExemption = (): boolean => !useUpsert.getField('passengerQuarantineRequirement.isAgeExemption')?.value;

  const isPassengerGovtSelfMonitoringRequired = (): boolean =>
    !useUpsert.getField('passengerQuarantineRequirement.isGovtSelfMonitoringRequired')?.value;

  const isPassengerTestExemption = (): boolean =>
    !useUpsert.getField('passengerQuarantineRequirement.isTestExemption')?.value;

  const isCrewRequirementRequired = (): boolean =>
    !useUpsert.getField('crewQuarantineRequirement.isQuarantineRequired')?.value;

  const isPassengerRequirementRequired = (): boolean =>
    !useUpsert.getField('passengerQuarantineRequirement.isQuarantineRequired')?.value;

  return {
    useUpsert,
    setFormValidations,
    healthAuthorization,
    _healthAuthStore,
    setTestInformatiOnValidations,
    setMonitoringMethodValidations,
    setQuarantineLocationsValidations,
    setTravelHistoryValidations,
    setQuarantinePeriodValidations,
    setAgeExemptionValidations,
    clearValidations,
    setHealthAuthorization,
    params,
    groupInputContols,
  };
};

export default useQuarantineRequirementBase;
