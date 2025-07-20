import { useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router';
import {
  HealthAuthModel,
  HealthAuthStore,
  SettingsStore,
  StayRequirementModel,
  VACCINE_PRIVILEGE,
} from '../../../Shared';
import { fields } from './Fields';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { Utilities, SettingsTypeModel, baseEntitySearchFilters } from '@wings-shared/core';
import { useStyles } from './StayRequirement.styles';

export interface BaseProps {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
}

const useStayRequirementBase = ({ ...props }) => {
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields, baseEntitySearchFilters);
  const classes = useStyles();
  const _healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const healthAuth = props.healthAuthStore?.selectedHealthAuth as HealthAuthModel;
  const _settingsStore = props.settingsStore as SettingsStore;

  /* istanbul ignore next */
  const clearValidations = (prefix: string): void => {
    if (Utilities.isEqual(prefix, 'passengerStayRequirement')) {
      groupInputContols()[1].inputControls.forEach(x =>
        useUpsert.setFormRules(x.fieldKey as string, false, useUpsert.getField(x.fieldKey as string).label)
      );

      return;
    }
    groupInputContols()[0].inputControls.forEach(x =>
      useUpsert.setFormRules(x.fieldKey as string, false, useUpsert.getField(x.fieldKey as string).label)
    );
  };

  const setVaccineExemptionValues = (): void => {
    setCrewExemptionValues();
    setPassengerVaccineExemption();
  };

  const setCrewExemptionValues = (): void => {
    const { vaccinePrivileges } = healthAuth?.crewVaccinationRequirement;
    const isStay: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.STAY_TEST_EXEMPTION);
    useUpsert.getField('crewStayRequirement.isVaccineExemption').set(isStay);
  };

  const setPassengerVaccineExemption = (): void => {
    const { vaccinePrivileges } = healthAuth?.passengerVaccinationRequirement;
    const isStay: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.STAY_TEST_EXEMPTION);
    useUpsert.getField('passengerStayRequirement.isVaccineExemption').set(isStay);
  };

  /* istanbul ignore next */
  const resetStayRequirement = (entity: string, isStayRequired: boolean): void => {
    const isCrew: boolean = Utilities.isEqual(entity, 'crewStayRequirement');
    const formValues: HealthAuthModel = useUpsert.form.values();
    const paxCrew = new SettingsTypeModel({ id: isCrew ? 2 : 1 });
    const model = new StayRequirementModel({ paxCrew, isStayRequired });
    if (isCrew) {
      formValues.crewStayRequirement = model;
      useUpsert.setFormValues(formValues);
      setVaccineExemptionValues();
      return;
    }
    formValues.passengerStayRequirement = model;
    useUpsert.setFormValues(formValues);
    setVaccineExemptionValues();
  };

  const setStayLengthValidation = (prefix: string, isRequired: boolean) =>
    useUpsert.setFormRules(`${prefix}.stayLength`, isRequired, 'Stay Length');

  const setLengthOfStayValue = (prefix: string, value: boolean) =>
    useUpsert.getField(`${prefix}.isLengthOfStay`).set(value);

  const setFormValidations = (prefix: string = '') => {
    if (Utilities.isEqual(prefix, 'crewStayRequirement')) {
      setStayLengthValidation('crewStayRequirement', useUpsert.form.values().crewStayRequirement.isStayRequired);
      return;
    }
    if (Utilities.isEqual(prefix, 'passengerStayRequirement')) {
      setStayLengthValidation(
        'passengerStayRequirement',
        useUpsert.form.values().passengerStayRequirement.isStayRequired
      );
      return;
    }
    setStayLengthValidation('crewStayRequirement', healthAuth.crewStayRequirement.isStayRequired);
    setStayLengthValidation('passengerStayRequirement', healthAuth.passengerStayRequirement.isStayRequired);
  };

  /* istanbul ignore next */
  const groupInputContols = (): IGroupInputControls[] => {
    return [
      {
        title: 'Crew Stay Requirement',
        inputControls: [
          {
            fieldKey: 'crewStayRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: !Boolean(healthAuth.parentId),
            isFullFlex: true,
          },
          {
            fieldKey: 'crewStayRequirement.isStayRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.isVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.stayLengthCategory',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isCrewRequirementRequired(),
            options: _settingsStore.stayLengthCategories,
            isIndent: true,
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.stayLength',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired(),
            endAdormentValue: 'Days',
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.isLengthOfStay',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.isGovernmentHealthCheckRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isCrewRequirementRequired(),
            isFullFlex: true,
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.isTestRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.testType',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isCrewRequirementRequired() || isCrewTestRequired(),
            options: _settingsStore.testTypes,
            isIndent: true,
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.testFrequenciesName',
            type: EDITOR_TYPES.CHIP_INPUT,
            isHidden: isCrewRequirementRequired() || isCrewTestRequired(),
            customErrorMessage: 'Test Frequencies must be a number between 1 and 99.',
            isNumber: true,
            classes: { root: classes.chipRoot }
          },
          {
            fieldKey: 'crewStayRequirement.testFrequency',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isCrewRequirementRequired() || isCrewTestRequired(),
          },
          {
            fieldKey: 'crewStayRequirement.testVendorAllowed',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: true,
          },
          {
            fieldKey: 'crewStayRequirement.isSpecificHotelsOnly',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.hotelsAllowedName',
            type: EDITOR_TYPES.CHIP_INPUT,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired() || isCrewSpecificHotelsOnly(),
            isIndent: true,
            customErrorMessage: 'Hotel name should not exceed 100 characters',
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.isCrewDesignationChange',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.crewDesignationChangeLengthOfStay',
            type: EDITOR_TYPES.TEXT_FIELD,
            isBoolean: true,
            isHidden: isCrewRequirementRequired() || isCrewLengthOfStayRequired(),
            isIndent: true,
            endAdormentValue: 'Days',
            isDisabled: isCrewStayInherited(),
          },
          {
            fieldKey: 'crewStayRequirement.extraInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            rows: 4,
            multiline: true,
            isDisabled: isCrewStayInherited(),
          },
        ],
      },
      {
        title: 'Passenger Stay Requirement',
        inputControls: [
          {
            fieldKey: 'passengerStayRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: !Boolean(healthAuth.parentId),
            isFullFlex: true,
          },
          {
            fieldKey: 'passengerStayRequirement.isStayRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.isVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.stayLengthCategory',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isPassengerRequirementRequired(),
            options: _settingsStore.stayLengthCategories,
            isIndent: true,
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.stayLength',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired(),
            endAdormentValue: 'Days',
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.isLengthOfStay',
            type: EDITOR_TYPES.CHECKBOX,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.isGovernmentHealthCheckRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isHidden: isPassengerRequirementRequired(),
            isFullFlex: true,
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.isTestRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.testType',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isPassengerRequirementRequired() || isPassengerTestRequired(),
            options: _settingsStore.testTypes,
            isIndent: true,
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.testFrequenciesName',
            type: EDITOR_TYPES.CHIP_INPUT,
            isHidden: isPassengerRequirementRequired() || isPassengerTestRequired(),
            customErrorMessage: 'Test Frequencies must be a number between 1 and 99.',
            isNumber: true,
          },
          {
            fieldKey: 'passengerStayRequirement.testFrequency',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHidden: isPassengerRequirementRequired() || isPassengerTestRequired(),
          },
          {
            fieldKey: 'passengerStayRequirement.testVendorAllowed',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: true,
          },
          {
            fieldKey: 'passengerStayRequirement.isSpecificHotelsOnly',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerRequirementRequired(),
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.hotelsAllowedName',
            type: EDITOR_TYPES.CHIP_INPUT,
            isFullFlex: true,
            isHidden: isPassengerRequirementRequired() || isPassengerSpecificHotelsOnly(),
            isIndent: true,
            customErrorMessage: 'Hotel name should not exceed 100 characters',
            isDisabled: isPassengerStayInherited(),
          },
          {
            fieldKey: 'passengerStayRequirement.extraInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isPassengerRequirementRequired(),
            rows: 4,
            multiline: true,
            isDisabled: isPassengerStayInherited(),
          },
        ],
      },
    ];
  };

  const isCrewStayInherited = (): boolean => useUpsert.getField('crewStayRequirement.isInherited').values();

  const isPassengerStayInherited = (): boolean => useUpsert.getField('passengerStayRequirement.isInherited').values();

  const isCrewRequirementRequired = (): boolean => !useUpsert.getField('crewStayRequirement.isStayRequired')?.value;

  const isCrewTestRequired = (): boolean => !useUpsert.getField('crewStayRequirement.isTestRequired')?.value;

  const isCrewLengthOfStayRequired = (): boolean =>
    !useUpsert.getField('crewStayRequirement.isCrewDesignationChange')?.value;

  const isCrewSpecificHotelsOnly = (): boolean =>
    !useUpsert.getField('crewStayRequirement.isSpecificHotelsOnly')?.value;

  const isPassengerRequirementRequired = (): boolean =>
    !useUpsert.getField('passengerStayRequirement.isStayRequired')?.value;

  const isPassengerTestRequired = (): boolean => !useUpsert.getField('passengerStayRequirement.isTestRequired')?.value;

  const isPassengerSpecificHotelsOnly = (): boolean =>
    !useUpsert.getField('passengerStayRequirement.isSpecificHotelsOnly')?.value;
  return {
    useUpsert,
    setFormValidations,
    resetStayRequirement,
    clearValidations,
    params,
    groupInputContols,
    healthAuth,
    setVaccineExemptionValues,
    setStayLengthValidation,
    setLengthOfStayValue,
    _settingsStore,
    _healthAuthStore,
  };
};

export default useStayRequirementBase;
