import { useBaseUpsertComponent } from '@wings/shared';
import { HealthAuthModel, HealthAuthStore, SettingsStore, VACCINE_PRIVILEGE } from '../../../Shared';
import { fields } from './Fields';
import { useParams } from 'react-router';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { baseEntitySearchFilters } from '@wings-shared/core';

export interface BaseProps {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
}

const useDomesticBase = ({ ...props }) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields, baseEntitySearchFilters);
  const healthAuth = props.healthAuthStore?.selectedHealthAuth as HealthAuthModel;
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const _settingsStore = props.settingsStore as SettingsStore;

  const setVaccineExemptionValues = () => {
    setCrewExemptionValues();
    setPassengerVaccineExemption();
  };

  const setCrewExemptionValues = () => {
    const { vaccinePrivileges } = healthAuth?.crewVaccinationRequirement;
    const isDomestic: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.DOMESTIC_MEASURE_EXEMPTION);
    useUpsert.getField('domesticMeasure.isCrewVaccineExemption').set(isDomestic);
  };

  const setPassengerVaccineExemption = (): void => {
    const { vaccinePrivileges } = healthAuth?.passengerVaccinationRequirement;
    const isDomestic: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.DOMESTIC_MEASURE_EXEMPTION);
    useUpsert.getField('domesticMeasure.isPassengerVaccineExemption').set(isDomestic);
  };

  const setFormValidations = (isForm: boolean = false): void => {
    const { domesticMeasure } = isForm ? useUpsert.form.values() : healthAuth;
    setAgeValidations(domesticMeasure.isAgeExemption);
    setPPETypesValidations(domesticMeasure.isPPERequired);
    setIdRequiredValidations(domesticMeasure.isIdentificationRequiredOnPerson);
    useUpsert.form.validate();
  };

  const setAgeValidations = (isRequired: boolean): void => {
    useUpsert.setFormRules('domesticMeasure.age', isRequired, 'Age');
    useUpsert.setFormRules('domesticMeasure.ageExemptionInfo', isRequired, 'Age Exemption Info');
    if (!isRequired) {
      useUpsert.getField('domesticMeasure.age').set(null);
    }
  };

  const setPPETypesValidations = (isRequired: boolean): void => {
    useUpsert.setFormRules('domesticMeasure.domesticMeasurePPERequired', isRequired, 'PPE Type');
  };

  const setIdRequiredValidations = (isRequired: boolean): void => {
    useUpsert.setFormRules('domesticMeasure.domesticMeasureIdRequired', isRequired, 'Id Type');
  };

  const isAgeRequired = (): boolean => {
    return !Boolean(useUpsert.getField('domesticMeasure.isAgeExemption').value);
  };

  const isPPERequired = (): boolean => {
    return !Boolean(useUpsert.getField('domesticMeasure.isPPERequired').value);
  };

  const isDomesticMeasureIdRequired = (): boolean => {
    return !Boolean(useUpsert.getField('domesticMeasure.isIdentificationRequiredOnPerson').value);
  };

  const isInherited = (): boolean => {
    return Boolean(useUpsert.getField('domesticMeasure.isInherited').value);
  };

  /* istanbul ignore next */
  const groupInputContols = (): IGroupInputControls[] => {
    return [
      {
        title: 'Domestic Measure',
        inputControls: [
          {
            fieldKey: 'domesticMeasure.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isFullFlex: true,
            isHidden: !Boolean(healthAuth.parentId),
          },
          {
            fieldKey: 'domesticMeasure.isIdentificationRequiredOnPerson',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'ID required on Person during Stay',
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.isCrewVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.domesticMeasureIdRequired',
            type: EDITOR_TYPES.DROPDOWN,
            label: 'Id Required',
            multiple: true,
            options: _settingsStore.idTypes,
            isFullFlex: true,
            isIndent: true,
            isHidden: isDomesticMeasureIdRequired(),
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.isAgeExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Age Exemption',
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.isPassengerVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.age',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isAgeRequired(),
            isIndent: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.ageExemptionInfo',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 3,
            isFullFlex: true,
            isHidden: isAgeRequired(),
            isIndent: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.isPPERequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'PPE Required',
            isFullFlex: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.domesticMeasurePPERequired',
            type: EDITOR_TYPES.DROPDOWN,
            label: 'PPE Type',
            multiple: true,
            options: _settingsStore.ppeTypes,
            isHalfFlex: true,
            isHidden: isPPERequired(),
            isIndent: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.isAllowedTravelInCountry',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            label: 'Allowed Travel Within Country',
            isFullFlex: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.domesticTravelRequirements',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 5,
            isFullFlex: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.domesticMeasureCurfewHours',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            label: 'Curfew Hours',
            isFullFlex: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.domesticMeasureRestrictedActivitiesName',
            type: EDITOR_TYPES.CHIP_INPUT,
            customErrorMessage: 'Activity name should not exceed 50 characters',
            isFullFlex: true,
            multiline: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.businessAvailable',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Business Availability',
            multiline: true,
            rows: 5,
            isFullFlex: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.extraInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            label: 'Other Information',
            multiline: true,
            rows: 5,
            isFullFlex: true,
            isDisabled: isInherited(),
          },
          {
            fieldKey: 'domesticMeasure.stateRegionSpecificInfo',
            type: EDITOR_TYPES.TEXT_FIELD,
            multiline: true,
            rows: 5,
            isFullFlex: true,
          },
        ],
      },
    ];
  };
  return {
    useUpsert,
    setFormValidations,
    params,
    groupInputContols,
    healthAuth,
    setVaccineExemptionValues,
    _settingsStore,
    _healthAuthStore,
    setAgeValidations,
    setPPETypesValidations,
    setIdRequiredValidations,
    isInherited
  };
};
export default useDomesticBase;
