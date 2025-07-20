import { useBaseUpsertComponent } from '@wings/shared';
import { useParams } from 'react-router';
import {
  ExitRequirementModel,
  HealthAuthModel,
  HealthAuthStore,
  SettingsStore,
  VACCINE_PRIVILEGE,
} from '../../../Shared';
import { fields } from './Fields';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { Utilities, SettingsTypeModel, baseEntitySearchFilters } from '@wings-shared/core';
import { useState } from 'react';

export interface BaseProps {
  healthAuthStore?: HealthAuthStore;
  settingsStore?: SettingsStore;
}

const useExitRequirementBase = ({ ...props }) => {
  const [ isRowEditing, setIsRowEditing ] = useState<boolean>(false);
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<HealthAuthModel>(params, fields, baseEntitySearchFilters);
  const healthAuth = props.healthAuthStore?.selectedHealthAuth as HealthAuthModel;
  const healthAuthStore = props.healthAuthStore as HealthAuthStore;
  const settingsStore = props.settingsStore as SettingsStore;

  const clearValidations = (prefix: string): void => {
    if (Utilities.isEqual(prefix, 'passengerExitRequirement')) {
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
    const isExit: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.EXIT_TEST_EXEMPTION);
    useUpsert.getField('crewExitRequirement.isVaccineExemption').set(isExit);
  };

  const setPassengerVaccineExemption = (): void => {
    const { vaccinePrivileges } = healthAuth?.passengerVaccinationRequirement;
    const isExit: boolean = vaccinePrivileges.some(x => x.name === VACCINE_PRIVILEGE.EXIT_TEST_EXEMPTION);
    useUpsert.getField('passengerExitRequirement.isVaccineExemption').set(isExit);
  };

  const resetExitRequirement = (entity: string, isExitRequirement: boolean): void => {
    const isCrew: boolean = Utilities.isEqual(entity, 'crewExitRequirement');
    const formValues: HealthAuthModel = useUpsert.form.values();
    const paxCrew = new SettingsTypeModel({ id: isCrew ? 2 : 1 });
    const model = new ExitRequirementModel({ paxCrew, isExitRequirement });
    if (isCrew) {
      formValues.crewExitRequirement = model;
      useUpsert.setFormValues(formValues);
      setVaccineExemptionValues();
      return;
    }
    formValues.passengerExitRequirement = model;
    useUpsert.setFormValues(formValues);
    setVaccineExemptionValues();
  };

  const setCrewValidations = (crewExitRequirement): void => {
    setTestRequirentValidations('crewExitRequirement', crewExitRequirement.isPreDepartureTestRequired);
    setBoardingTypesValidations('crewExitRequirement', crewExitRequirement.isProofToBoard);
    setFormRequirementValidations('crewExitRequirement', crewExitRequirement.isFormsRequired);
  };

  const setPassengerValidations = (passengerExitRequirement): void => {
    setFormRequirementValidations('passengerExitRequirement', passengerExitRequirement.isFormsRequired);
    setBoardingTypesValidations('passengerExitRequirement', passengerExitRequirement.isProofToBoard);
    setTestRequirentValidations('passengerExitRequirement', passengerExitRequirement.isPreDepartureTestRequired);
  };

  const setFormValidation = (prefix: string = ''): void => {
    if (Utilities.isEqual(prefix, 'crewExitRequirement')) {
      setCrewValidations(useUpsert.form.values().crewExitRequirement);
      return;
    }
    if (Utilities.isEqual(prefix, 'passengerExitRequirement')) {
      setPassengerValidations(useUpsert.form.values().passengerExitRequirement);
      return;
    }

    const { selectedHealthAuth } = healthAuthStore as HealthAuthStore;
    const { crewExitRequirement, passengerExitRequirement } = selectedHealthAuth;
    setCrewValidations(crewExitRequirement);
    setPassengerValidations(passengerExitRequirement);
  };

  const setFormRequirementValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.formRequirements`, required, 'Form Requirements');
  };

  const setTestRequirentValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.testType`, required, 'Test Type');
    useUpsert.setFormRules(`${prefix}.testFrequenciesName`, required, 'Test Frequencies');
  };

  const setBoardingTypesValidations = (prefix: string, required: boolean): void => {
    useUpsert.setFormRules(`${prefix}.boardingTypes`, required, 'Boarding Types');
  };

  const isPassengerBoardingTypesRequired = (): boolean => {
    return !Boolean(useUpsert.getField('passengerExitRequirement.isProofToBoard').value);
  };

  const isCrewBoardingTypesRequired = (): boolean => {
    return !Boolean(useUpsert.getField('crewExitRequirement.isProofToBoard').value);
  };

  /* istanbul ignore next */
  const groupInputContols = (): IGroupInputControls[] => {
    return [
      {
        title: 'Crew Exit Requirement',
        inputControls: [
          {
            fieldKey: 'crewExitRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isFullFlex: true,
            isHidden: !Boolean(healthAuth.parentId),
            isDisabled: isRowEditing,
          },
          {
            fieldKey: 'crewExitRequirement.isExitRequirement',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.isVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.isSymptomBased',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.isFormsRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.formRequirements',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            isHidden: isCrewRequirementRequired() || isCrewFormsRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.isPreDepartureTestRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.testType',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isCrewRequirementRequired() || isCrewTestRequired(),
            options: settingsStore.testTypes,
            isIndent: true,
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.testFrequenciesName',
            type: EDITOR_TYPES.CHIP_INPUT,
            isHidden: isCrewRequirementRequired() || isCrewTestRequired(),
            customErrorMessage: 'Test Frequencies must be a number between 1 and 99.',
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Hrs',
            isHidden: isCrewRequirementRequired() || isCrewTestRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.isPreDepartureTestVaccineExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.isArrivalTestVaccineExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.isProofToBoard',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.boardingTypes',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: settingsStore.boardingTypes,
            label: 'Boarding Types',
            isHidden: isCrewRequirementRequired() || isCrewBoardingTypesRequired(),
            isHalfFlex: true,
            isIndent: true,
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.consequences',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            rows: 4,
            multiline: true,
            isDisabled: isCrewInherited(),
          },
          {
            fieldKey: 'crewExitRequirement.extraInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isCrewRequirementRequired(),
            rows: 4,
            multiline: true,
            isDisabled: isCrewInherited(),
          },
        ],
      },
      {
        title: 'Passenger Exit Requirement',
        inputControls: [
          {
            fieldKey: 'passengerExitRequirement.isInherited',
            type: EDITOR_TYPES.CHECKBOX,
            isFullFlex: true,
            isHidden: !Boolean(healthAuth.parentId),
            isDisabled: isRowEditing,
          },
          {
            fieldKey: 'passengerExitRequirement.isExitRequirement',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.isVaccineExemption',
            type: EDITOR_TYPES.LABEL,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.isSymptomBased',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.isFormsRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.formRequirements',
            type: EDITOR_TYPES.CUSTOM_COMPONENT,
            isHidden: isPassengerExitRequired() || isPassengerFormsRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.isPreDepartureTestRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.testType',
            type: EDITOR_TYPES.DROPDOWN,
            isHidden: isPassengerExitRequired() || isPassengerFormsRequired(),
            options: settingsStore.testTypes,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.testFrequenciesName',
            type: EDITOR_TYPES.CHIP_INPUT,
            isHidden: isPassengerExitRequired() || isPassengerTestRequired(),
            customErrorMessage: 'Test Frequencies must be a number between 1 and 99.',
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.leadTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            endAdormentValue: 'Hrs',
            isHidden: isPassengerExitRequired() || isPassengerTestRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.isPreDepartureTestVaccineExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.isArrivalTestVaccineExemption',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.isProofToBoard',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.boardingTypes',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: settingsStore.boardingTypes,
            label: 'Boarding Types',
            isHidden: isPassengerExitRequired() || isPassengerBoardingTypesRequired(),
            isHalfFlex: true,
            isIndent: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.consequences',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            rows: 4,
            multiline: true,
            isDisabled: isPassengerInherited(),
          },
          {
            fieldKey: 'passengerExitRequirement.extraInformation',
            type: EDITOR_TYPES.TEXT_FIELD,
            isFullFlex: true,
            isHidden: isPassengerExitRequired(),
            rows: 4,
            multiline: true,
            isDisabled: isPassengerInherited(),
          },
        ],
      },
    ];
  };

  const isCrewInherited = (): boolean => Boolean(useUpsert.getField('crewExitRequirement.isInherited')?.value);

  const isPassengerInherited = (): boolean =>
    Boolean(useUpsert.getField('passengerExitRequirement.isInherited')?.value);

  const isPassengerExitRequired = (): boolean =>
    !useUpsert.getField('passengerExitRequirement.isExitRequirement')?.value;

  const isPassengerFormsRequired = (): boolean =>
    !useUpsert.getField('passengerExitRequirement.isFormsRequired')?.value;

  const isPassengerTestRequired = (): boolean =>
    !useUpsert.getField('passengerExitRequirement.isPreDepartureTestRequired')?.value;

  const isCrewRequirementRequired = (): boolean => !useUpsert.getField('crewExitRequirement.isExitRequirement')?.value;

  const isCrewFormsRequired = (): boolean => !useUpsert.getField('crewExitRequirement.isFormsRequired')?.value;

  const isCrewTestRequired = (): boolean =>
    !useUpsert.getField('crewExitRequirement.isPreDepartureTestRequired')?.value;

  return {
    useUpsert,
    clearValidations,
    params,
    groupInputContols,
    healthAuth,
    setFormValidation,
    setVaccineExemptionValues,
    setBoardingTypesValidations,
    setFormRequirementValidations,
    setTestRequirentValidations,
    isRowEditing,
    setIsRowEditing,
    healthAuthStore,
    settingsStore,
    resetExitRequirement,
  };
};

export default useExitRequirementBase;
