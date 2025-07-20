import React, { ReactNode, Ref, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Paper } from '@material-ui/core';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import {
  AuditFields,
  EDITOR_TYPES,
  ViewInputControl,
  IViewInputControl,
  IGroupInputControls,
} from '@wings-shared/form-controls';
import { IOptionValue, ISelectOption, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import { observable } from 'mobx';
import { EtpScenarioStore, EtpSettingsStore, SettingsStore } from '../../../Shared/Stores';
import { fields } from './Fields';
import { useStyles } from './EtpScenarioEditor.style';
import { EtpScenarioDetailModel, LEVEL_OFF, MAIN_DESCENT } from '../../../Shared';
import classNames from 'classnames';
import { Collapsable } from '@wings-shared/layout';
import { useParams } from 'react-router';
import EtpPenaltiesGrid from '../EtpPenaltiesGrid/EtpPenaltiesGrid';
import { observer } from 'mobx-react';

interface Props {
  ref?: Ref<any>;
  etpScenarioDetailModel: EtpScenarioDetailModel;
  etpSettingsStore: EtpSettingsStore;
  etpScenarioStore: EtpScenarioStore;
  settingsStore: SettingsStore;
  viewMode: VIEW_MODE;
  onChange: (model: EtpScenarioDetailModel) => void;
  isSaveEnabled?: (enable: boolean) => void;
}

const EtpScenarioEditor = ({ ...props }: Props, ref) => {
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<EtpScenarioDetailModel>(params, fields, baseEntitySearchFilters);
  const _etpSettingsStore = props.etpSettingsStore as EtpSettingsStore;
  const _etpScenarioStore = props.etpScenarioStore as EtpScenarioStore;
  const _settingsStore = props.settingsStore as SettingsStore;
  const etpScenarioPenaltyGridRef = useRef<typeof EtpPenaltiesGrid>();
  const etpScenarioDetailModel: any = observable({
    data: props.etpScenarioDetailModel,
  });

  /* istanbul ignore next */
  useEffect(() => {
    const { etpScenarioDetailModel } = props;
    useUpsert.setFormValues(etpScenarioDetailModel);
    setFormValidationRules(etpScenarioDetailModel);
  }, []);

  const hasError = useMemo(() => {
    const penaltyError = etpScenarioPenaltyGridRef.current?.hasPenaltyError ?? false;
  
    if (useUpsert.form.hasError || penaltyError) {
      if (props.isSaveEnabled) {
        props.isSaveEnabled(true);  // Only call if it's defined
      }
      return true;
    }
  
    if (props.isSaveEnabled) {
      props.isSaveEnabled(false);  // Only call if it's defined
    }
    return false;
  }, [ etpScenarioPenaltyGridRef.current?.hasPenaltyError, useUpsert.form.hasError ]);
  
  

  useImperativeHandle(
    ref,
    () => {
      return {
        setInitialFormValues,
        hasError,
      };
    },
    [ hasError ]
  );

  const isLevelOffFixed = (): boolean => {
    return useUpsert.getField('etpInitialDescent.etpLevelOff').value?.label === LEVEL_OFF.FIXED;
  };
  const isDriftDown = (): boolean => {
    return useUpsert.getField('etpInitialDescent.etpMainDescent').value?.label === MAIN_DESCENT.DRIFT_DOWN;
  };
  const isLevelOff = (): boolean => {
    return useUpsert.getField('etpInitialDescent.etpMainDescent').value?.label === MAIN_DESCENT.LEVEL_OFF;
  };
  const isApuBurnFixed = (): boolean => {
    return useUpsert.getField('etpApuBurn.etpApuBurnMethod').value?.label === 'Fixed';
  };
  const additionalMaxFlightLevel1 = (): boolean => {
    return useUpsert.getField('cruiseEtpProfile.additionalMaxFlightLevel1').value;
  };
  const isInstantaneous = (): boolean => {
    return useUpsert.getField('etpInitialDescent.etpMainDescent').value?.label === MAIN_DESCENT.INSTANTANEOUS;
  };
  const isFixed = (): boolean => {
    return useUpsert.getField('etpInitialDescent.etpMainDescent').value?.label === MAIN_DESCENT.FIXED;
  };
  const isFinalDescentFixed = (): boolean => {
    return useUpsert.getField('etpFinalDescentBurn.etpFinalDescentBurnMethod').value?.label === 'Fixed';
  };
  const isEtpHoldFixed = (): boolean => {
    return useUpsert.getField('etpHold.etpHoldMethod').value?.label === 'Fixed';
  };

  const setFormValidationRules = (etpScenarioDetail: EtpScenarioDetailModel): void => {
    if (etpScenarioDetailModel.data?.id) {
      const { etpInitialDescent, etpHold, etpApuBurn, cruiseEtpProfile, etpFinalDescentBurn } = etpScenarioDetail;
      setCruiseEtpProfileRules(
        cruiseEtpProfile.maxFlightLevelIncrement?.toString(),
        'cruiseEtpProfile.maxFlightLevelIncrement'
      );
      setCruiseEtpProfileRules(
        cruiseEtpProfile.additionalMaxFlightLevel1?.toString(),
        'cruiseEtpProfile.additionalMaxFlightLevel1'
      );
      setCruiseEtpProfileRules(
        cruiseEtpProfile.additionalMaxFlightLevel2?.toString(),
        'cruiseEtpProfile.additionalMaxFlightLevel2'
      );
      setFinalDescentRules(
        etpFinalDescentBurn.etpFinalDescentBurnMethod as IOptionValue,
        'etpFinalDescentBurn.etpFinalDescentBurnMethod'
      );
      setEtpHoldRules(etpHold.etpHoldMethod as IOptionValue, 'etpHold.etpHoldMethod');
      setEtpApuBurnRules(etpApuBurn.etpApuBurnMethod, 'etpApuBurn.etpApuBurnMethod');
      setInitialDescentRules(etpInitialDescent.etpMainDescent, 'etpInitialDescent.etpMainDescent');
      setInitialDescentRules(etpInitialDescent.etpLevelOff, 'etpInitialDescent.etpLevelOff');
      setInitialDescentRules(etpInitialDescent.etpAltDescent, 'etpInitialDescent.etpAltDescent');
    }
  };

  const setInitialFormValues = (etpScenarioDetailModel: EtpScenarioDetailModel): void => {
    useUpsert.setFormValues(etpScenarioDetailModel);
    setFormValidationRules(etpScenarioDetailModel);
    etpScenarioPenaltyGridRef.current?.resetData(etpScenarioDetailModel.etpPenalties);
  };

  const isEditable = (): boolean => {
    return props.viewMode === VIEW_MODE.EDIT || props.viewMode === VIEW_MODE.NEW;
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: 'General',
        inputControls: [
          {
            fieldKey: 'etpScenarioEngine',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.ETPScenarioEngines,
            isHalfFlex: true,
          },
          {
            fieldKey: 'etpScenarioType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.etpScenarioTypes,
            isHalfFlex: true,
          },
          {
            fieldKey: 'etpTimeLimitType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.etpTimeLimitTypes,
            isHalfFlex: true,
          },
          {
            fieldKey: 'weightUom',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.weightUOMs,
            isHalfFlex: true,
          },
          {
            fieldKey: 'etpScenarioNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
            isExists: isEtpScenarioNumberExists(),
          },
          {
            fieldKey: 'nfpScenarioNumber',
            type: EDITOR_TYPES.TEXT_FIELD,
            isExists: isNfpScenarioNumberExists(),
          },
          {
            fieldKey: 'description',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Initial Descent',
        inputControls: [
          {
            fieldKey: 'etpInitialDescent.etpMainDescent',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.ETPMainDescents,
            isHalfFlex: true,
          },
          {
            fieldKey: 'etpInitialDescent.etpAltDescent',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.etpAltDescentProfiles,
            isHalfFlex: true,
            isDisabled: !isDriftDown(),
          },
          {
            fieldKey: 'etpInitialDescent.normalProfile',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isInstantaneous() || isFixed(),
            isHalfFlex: true,
          },
          {
            fieldKey: 'etpInitialDescent.icingProfile',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: isInstantaneous() || isFixed(),
            isHalfFlex: true,
          },
          {
            fieldKey: 'etpInitialDescent.fixedTime',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isInitialFixedReq(),
          },
          {
            fieldKey: 'etpInitialDescent.fixedBurn',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isInitialFixedReq(),
          },
          {
            fieldKey: 'etpInitialDescent.fixedDistance',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isInitialFixedReq(),
          },
          {
            fieldKey: 'etpInitialDescent.etpLevelOff',
            type: EDITOR_TYPES.DROPDOWN,
            options: etpLevelOptions(),
            isHalfFlex: true,
            isDisabled: isLevelOff(),
          },
          {
            fieldKey: 'etpInitialDescent.flightLevel',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isLevelOffFixed(),
            isHalfFlex: true,
          },
        ],
      },
      {
        title: 'ETP Cruise Profile',
        inputControls: [
          {
            fieldKey: 'cruiseEtpProfile.etpCruise',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.ETPCruiseProfiles,
            isFullFlex: true,
          },
          {
            fieldKey: 'cruiseEtpProfile.maxFlightLevel',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cruiseEtpProfile.maxFlightLevelIncrement',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cruiseEtpProfile.maxFlightLevelIncrementLimit',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cruiseEtpProfile.speed',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'cruiseEtpProfile.additionalMaxFlightLevel1',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'cruiseEtpProfile.additionalTime1',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !additionalMaxFlightLevel1(),
            isHalfFlex: true,
          },
          {
            fieldKey: 'cruiseEtpProfile.additionalMaxFlightLevel2',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
            isDisabled: !isAdditionalMFL2Disabled(),
          },
          {
            fieldKey: 'cruiseEtpProfile.additionalTime2',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !Boolean(useUpsert.getField('cruiseEtpProfile.additionalMaxFlightLevel2').value),
            isHalfFlex: true,
          },
        ],
      },
      {
        title: 'Final Descent Burn',
        inputControls: [
          {
            fieldKey: 'etpFinalDescentBurn.etpFinalDescentBurnMethod',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.ETPFinalDescents,
            isFullFlex: true,
          },
          {
            fieldKey: 'etpFinalDescentBurn.time',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isFinalDescentFixed(),
          },
          {
            fieldKey: 'etpFinalDescentBurn.burn',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isFinalDescentFixed(),
          },
          {
            fieldKey: 'etpFinalDescentBurn.distance',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isFinalDescentFixed(),
          },
        ],
      },
      {
        title: 'Hold',
        inputControls: [
          {
            fieldKey: 'etpHold.etpHoldMethod',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.ETPHoldMethods,
            isFullFlex: true,
          },
          {
            fieldKey: 'etpHold.flightLevel',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'etpHold.time',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'etpHold.burn',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isEtpHoldFixed(),
          },
        ],
      },
      {
        title: 'APU Burn',
        inputControls: [
          {
            fieldKey: 'etpApuBurn.etpApuBurnMethod',
            type: EDITOR_TYPES.DROPDOWN,
            options: _etpSettingsStore.ETPAPUBurnMethods,
            isHalfFlex: true,
          },
          {
            fieldKey: 'etpApuBurn.time',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isApuBurnFixed(),
          },
          {
            fieldKey: 'etpApuBurn.burn',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: !isApuBurnFixed(),
          },
        ],
      },
      {
        title: 'Missed Approach',
        inputControls: [
          {
            fieldKey: 'etpMissedApproach.time',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'etpMissedApproach.burn',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'etpMissedApproach.distance',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
        ],
      },
      {
        title: 'Other',
        inputControls: [
          {
            fieldKey: 'extRangeEntryPointRadius',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
          {
            fieldKey: 'comments',
            type: EDITOR_TYPES.TEXT_FIELD,
            isHalfFlex: true,
          },
        ],
      },
    ];
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    const etpEntity = fieldKey.split('.')[0];
    switch (etpEntity) {
      case 'etpInitialDescent':
        setInitialDescentRules(value, fieldKey);
        break;
      case 'cruiseEtpProfile':
        setCruiseEtpProfileRules(value, fieldKey);
        break;
      case 'etpFinalDescentBurn':
        setFinalDescentRules(value, fieldKey);
        break;
      case 'etpHold':
        setEtpHoldRules(value, fieldKey);
        break;
      case 'etpApuBurn':
        setEtpApuBurnRules(value, fieldKey);
        break;
    }
    updateFormValues(value, fieldKey);
  };

  const setEtpApuBurnRules = (value: IOptionValue, fieldKey: string): void => {
    const field = fieldKey.split('.')[1];
    if (field === 'etpApuBurnMethod') {
      const option = value as ISelectOption;
      switch (option?.label) {
        case 'Fixed':
          setRules('etpApuBurn.burn', true, 'Burn');
          break;
        default:
          setRules('etpApuBurn.burn', false, 'Burn');
          clearFields([ 'etpApuBurn.time', 'etpApuBurn.burn' ]);
      }
    }
  };

  const setEtpHoldRules = (value: IOptionValue, fieldKey: string): void => {
    const field = fieldKey.split('.')[1];
    if (Utilities.isEqual(field, 'etpHoldMethod')) {
      const option = value as ISelectOption;
      const isRequired = Utilities.isEqual(option?.label, 'Fixed');
      setRules('etpHold.burn', isRequired, 'Burn');
      setRules('etpHold.time', !isRequired, 'Time');
      if (!isRequired) {
        clearFields([ 'etpHold.burn' ]);
      }
    }
  };

  const setFinalDescentRules = (value: IOptionValue, fieldKey: string) => {
    const field = fieldKey.split('.')[1];
    if (field === 'etpFinalDescentBurnMethod') {
      const option = value as ISelectOption;
      const isRequired = option?.label === 'Fixed';
      setRules('etpFinalDescentBurn.time', isRequired, 'Time');
      setRules('etpFinalDescentBurn.burn', isRequired, 'Burn');
      setRules('etpFinalDescentBurn.distance', isRequired, 'Distance');
      if (!isRequired) {
        clearFields([ 'etpFinalDescentBurn.time', 'etpFinalDescentBurn.burn', 'etpFinalDescentBurn.distance' ]);
      }
    }
  };

  /* istanbul ignore next */
  const setCruiseEtpProfileRules = (value: IOptionValue, fieldKey: string): void => {
    const field = fieldKey.split('.')[1];
    switch (field) {
      case 'maxFlightLevelIncrement':
        setRules('cruiseEtpProfile.maxFlightLevelIncrementLimit', Boolean(value), 'Max Flight Level Increment Limit');
        break;
      case 'additionalMaxFlightLevel1':
        setRules('cruiseEtpProfile.additionalTime1', Boolean(value), 'Additional 1 Max Flight Time');
        if (!Boolean(value)) {
          setRules('cruiseEtpProfile.additionalTime2', false, 'Additional 2 Max Flight Time');
          clearFields([
            'cruiseEtpProfile.additionalTime1',
            'cruiseEtpProfile.additionalMaxFlightLevel2',
            'cruiseEtpProfile.additionalTime2',
          ]);
        }
        break;
      case 'additionalTime1':
        if (!Boolean(value)) {
          setRules('cruiseEtpProfile.additionalTime2', false, 'Additional 2 Max Flight Time');
          clearFields([ 'cruiseEtpProfile.additionalMaxFlightLevel2', 'cruiseEtpProfile.additionalTime2' ]);
        }
        break;
      case 'additionalMaxFlightLevel2':
        setRules('cruiseEtpProfile.additionalTime2', Boolean(value), 'Additional 2 Max Flight Time');
        if (!Boolean(value)) {
          clearFields([ 'cruiseEtpProfile.additionalTime2' ]);
        }
        break;
    }
  };

  /* istanbul ignore next */
  const setInitialDescentRules = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    const field = fieldKey.split('.')[1];
    if (field === 'etpMainDescent') {
      const option = value as ISelectOption;
      switch (option?.label) {
        case MAIN_DESCENT.DRIFT_DOWN:
          setInitialDescentFixedRules();
          setRules('etpInitialDescent.etpAltDescent', true, 'Alt Descent');
          setRules('etpInitialDescent.etpLevelOff', true, 'Level Off');
          setRules('etpInitialDescent.flightLevel', false, 'Flight Level');
          if (isLevelOffFixed())
            clearFields([
              'etpInitialDescent.etpLevelOff',
              'etpInitialDescent.flightLevel',
              'etpInitialDescent.etpAltDescent',
            ]);
          else {
            clearFields([ 'etpInitialDescent.flightLevel', 'etpInitialDescent.etpAltDescent' ]);
          }
          break;
        case MAIN_DESCENT.INSTANTANEOUS:
          setRules('etpInitialDescent.etpAltDescent', false, 'Alt Descent');
          setRules('etpInitialDescent.etpLevelOff', false, 'Level Off');
          clearFields([
            'etpInitialDescent.normalProfile',
            'etpInitialDescent.icingProfile',
            'etpInitialDescent.etpAltDescent',
          ]);
          setInitialDescentFixedRules();
          if (isLevelOffDriftDown()) {
            clearFields([ 'etpInitialDescent.etpLevelOff' ]);
          }
          break;
        case MAIN_DESCENT.FIXED:
          setInitialDescentFixedRules();
          setRules('etpInitialDescent.etpAltDescent', false, 'Alt Descent');
          setRules('etpInitialDescent.etpLevelOff', false, 'Level Off');
          clearFields([
            'etpInitialDescent.normalProfile',
            'etpInitialDescent.icingProfile',
            'etpInitialDescent.etpAltDescent',
          ]);
          if (isLevelOffDriftDown()) {
            clearFields([ 'etpInitialDescent.etpLevelOff' ]);
          }
          break;
        case MAIN_DESCENT.LEVEL_OFF:
          setRules('etpInitialDescent.etpAltDescent', false, 'Alt Descent');
          setRules('etpInitialDescent.flightLevel', true, 'Flight Level');
          clearFields([ 'etpInitialDescent.etpAltDescent' ]);
          const levelOff = useUpsert.getField('etpInitialDescent.etpLevelOff');
          const levelOffFixed = _etpSettingsStore.ETPLevels.find(x => x.name === LEVEL_OFF.FIXED);
          levelOff.set(levelOffFixed);
          setInitialDescentFixedRules();
          break;
      }
    }
    if (field === 'etpLevelOff') {
      const option = value as ISelectOption;
      switch (option?.label) {
        case LEVEL_OFF.FIXED:
          setRules('etpInitialDescent.flightLevel', true, 'Flight Level');
          break;
        default:
          setRules('etpInitialDescent.flightLevel', false, 'Flight Level');
          clearFields([ 'etpInitialDescent.flightLevel' ]);
      }
    }

    if (field === 'etpAltDescent') {
      const option = value as ISelectOption;
      if (option?.label) {
        setInitialDescentFixedRules();
      }
    }
  };

  const setInitialDescentFixedRules = (): void => {
    const required = isInitialFixedReq();

    setRules('etpInitialDescent.fixedTime', required, 'Fixed Time');
    setRules('etpInitialDescent.fixedBurn', required, 'Fixed Burn');
    setRules('etpInitialDescent.fixedDistance', required, 'Fixed Distance');
    if (!required) {
      clearFields([ 'etpInitialDescent.fixedTime', 'etpInitialDescent.fixedBurn', 'etpInitialDescent.fixedDistance' ]);
    }
  };

  const isAdditionalMFL2Disabled = (): boolean => {
    return (
      useUpsert.getField('cruiseEtpProfile.additionalMaxFlightLevel1').value &&
      useUpsert.getField('cruiseEtpProfile.additionalTime1').value
    );
  };

  const isLevelOffDriftDown = (): boolean => {
    const levelOffValue = useUpsert.getField('etpInitialDescent.etpLevelOff').value?.label;
    return Utilities.isEqual(levelOffValue, 'Drift Down');
  };

  const isInitialFixedReq = (): boolean => {
    return (
      useUpsert.getField('etpInitialDescent.etpAltDescent').value?.label === 'Fixed' ||
      useUpsert.getField('etpInitialDescent.etpMainDescent').value?.label === MAIN_DESCENT.FIXED
    );
  };

  const isEtpScenarioNumberExists = (): boolean => {
    const etpScenarioScenarioNumber = useUpsert.getField('etpScenarioNumber').value;
    return _etpScenarioStore.etpScenarios?.some(
      x => x.etpScenarioNumber === Number(etpScenarioScenarioNumber) && x.id != etpScenarioDetailModel.data?.id
    );
  };

  const isNfpScenarioNumberExists = (): boolean => {
    const _nfpScenarioNumber = useUpsert.getField('nfpScenarioNumber').value;
    return _etpScenarioStore.etpScenarios?.some(
      ({ nfpScenarioNumber, id }) =>
        Utilities.isEqual(nfpScenarioNumber, Number(_nfpScenarioNumber)) &&
        !Utilities.isEqual(id, etpScenarioDetailModel.data?.id)
    );
  };

  const etpLevelOptions = (): ISelectOption[] => {
    const { ETPLevels } = _etpSettingsStore;
    if (isDriftDown()) {
      return ETPLevels.filter(x => x.name !== LEVEL_OFF.FIXED);
    }
    if (isInstantaneous() || isFixed()) {
      return ETPLevels.filter(x => x.name !== LEVEL_OFF.DRIFT_DOWN);
    }
    return ETPLevels;
  };

  const setRules = (fieldKey: string, required: boolean, label: string): void => {
    const field = useUpsert.getField(fieldKey);
    const rules: string[] = field.rules?.split('|').filter(x => x) || [];
    const newRules = required
      ? rules.includes('required')
        ? rules
        : [ 'required', ...rules ]
      : rules.filter(x => x !== 'required');
    field.set('rules', newRules.join('|'));
    field.set('label', `${label}${required ? '*' : ''}`);
  };

  const clearFields = (fieldKeys: string[]): void => {
    fieldKeys.forEach(fieldKey => useUpsert.getField(fieldKey).set(''));
  };

  // update from Values
  const updateFormValues = (value: IOptionValue, fieldKey: string): EtpScenarioDetailModel => {
    useUpsert.getField(fieldKey).set(value);
    const model = getUpdatedModel();
    props.onChange(model);
    return model;
  };

  //   Get updated airport hours Model
  const getUpdatedModel = (): EtpScenarioDetailModel => {
    const formValues: EtpScenarioDetailModel = useUpsert.form.values();
    const updatedModel = new EtpScenarioDetailModel({
      ...etpScenarioDetailModel.data,
      ...formValues,
      etpPenalties: etpScenarioDetailModel.data?.etpPenalties,
    });
    return updatedModel;
  };

  const etpPenalties = (): ReactNode => {
    return (
      <>
        {etpScenarioDetailModel.data?.etpPenalties && (
          <EtpPenaltiesGrid
            ref={etpScenarioPenaltyGridRef}
            isEditable={isEditable()}
            etpSettingsStore={_etpSettingsStore}
            rowData={etpScenarioDetailModel.data?.etpPenalties}
            onDataUpdate={updatedData => {
              etpScenarioDetailModel.data.etpPenalties = updatedData;
              const model = getUpdatedModel();
              props.onChange(model);
            }}
          />
        )}
      </>
    );
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.flexContainer}>
        <div className={classes.flexRow}>
          {groupInputControls().map(({ title, inputControls }, index) => (
            <Collapsable key={index} title={title}>
              <div className={classes.flexWrap}>
                {inputControls
                  .filter(inputControl => !inputControl.isHidden)
                  .map((inputControl: IViewInputControl, index: number) => (
                    <ViewInputControl
                      {...inputControl}
                      key={index}
                      isExists={inputControl.isExists}
                      classes={{
                        flexRow: classNames({
                          [classes.halfFlex]: inputControl.isHalfFlex,
                          [classes.inputControl]: !inputControl.isHalfFlex,
                          [classes.fullFlex]: inputControl.isFullFlex,
                        }),
                        autoCompleteRoot: classNames({
                          [classes.labelRoot]: inputControl.isFullFlex,
                        }),
                      }}
                      customErrorMessage={inputControl.customErrorMessage}
                      field={useUpsert.getField(inputControl.fieldKey || '')}
                      isEditable={isEditable()}
                      onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                    />
                  ))}
              </div>
            </Collapsable>
          ))}
          <Collapsable title="ETP Penalties">
            <div className={classes.etpPenaltiesGrid}>{etpPenalties()}</div>
          </Collapsable>
          <AuditFields
            isEditable={isEditable()}
            fieldControls={useUpsert.auditFields}
            onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
            isNew={useUpsert.isAddNew}
          />
        </div>
      </div>
    </Paper>
  );
};

export default observer(forwardRef(EtpScenarioEditor));
