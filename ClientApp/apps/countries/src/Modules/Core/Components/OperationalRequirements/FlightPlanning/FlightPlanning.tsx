import { IOptionValue } from '@wings-shared/core';
import { EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import {
  BaseAircraftStore,
  BasePermitStore,
  FlightPlanningACASGridModel,
  FlightPlanningModel,
  IUseUpsert,
  withFormFields,
} from '@wings/shared';
import React, { FC, useEffect } from 'react';
import { flightPlanningFields } from '../fields';
import { CountryStore, EntityMapStore, OperationalRequirementStore } from '../../../../Shared';
import { inject, observer } from 'mobx-react';
import FlightPlanningACASGrid from './FlightPlanningACASGrid';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useConfirmDialog } from '@wings-shared/hooks';

interface Props {
  useUpsert: IUseUpsert;
  operationalRequirementStore?: OperationalRequirementStore;
  countryStore?: CountryStore;
  basePermitStore?: BasePermitStore;
  baseAircraftStore?: BaseAircraftStore;
  onRowEditingChange: (isRowEditing: boolean) => void;
  onFlightPlanningUpdate: (dataUpdate: boolean) => void;
  entityMapStore?: EntityMapStore;
}

const FlightPlanning: FC<Props> = observer(
  ({
    countryStore,
    basePermitStore,
    baseAircraftStore,
    useUpsert,
    onRowEditingChange,
    onFlightPlanningUpdate,
    operationalRequirementStore,
    entityMapStore,
  }: Props) => {
    const _entityMapStore = entityMapStore as EntityMapStore;
    const _basePermitStore = basePermitStore as BasePermitStore;
    const _baseAircraftStore = baseAircraftStore as BaseAircraftStore;
    const _operationalRequirementStore = operationalRequirementStore as OperationalRequirementStore;
    const _useConfirmDialog = useConfirmDialog();

    /* istanbul ignore next */
    useEffect(() => {
      loadInitialData();
      return () => {
        useUpsert.form.reset();
      };
    }, []);

    const updateACASIIInfo = (flightPlanningACAS: FlightPlanningACASGridModel[]): void => {
      const formData = useUpsert.form.values();
      useUpsert.setFormValues({ ...formData, acasiiAdditionalInformations: flightPlanningACAS });
      onFlightPlanningUpdate(true);
    };

    const loadInitialData = () => {
      const flightPlanning = countryStore?.selectedCountry?.flightPlanningOperationalRequirement;
      useUpsert.setFormValues(flightPlanning || new FlightPlanningModel());
    };

    const onFocus = (fieldKey: string): void => {
      switch (fieldKey) {
        case 'rvsmComplianceExceptions':
          useUpsert.observeSearch(_basePermitStore.getRvsmComplianceExceptions());
          break;
        case 'acasiiOrTCAS':
          useUpsert.observeSearch(_basePermitStore.getFlightOperationalCategories());
          break;
        case 'bannedAircrafts':
          useUpsert.observeSearch(_baseAircraftStore.getBannedAircraft());
          break;
        case 'noiseRestrictedAircrafts':
          useUpsert.observeSearch(_baseAircraftStore.getNoiseRestrictedAircraft());
          break;
        default:
          useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
          break;
      }
    };

    const onModalClose = (formData): void => {
      useUpsert.setFormValues({ ...formData, acasiIdataIsRqrd: true });
      ModalStore.close();
    };

    const deleteACASII = (formData): void => {
      useUpsert.setFormValues({ ...formData, acasiIdataIsRqrd: false, acasiiAdditionalInformations: [] });
      ModalStore.close();
    };

    const confirmRemoveACASInformation = (): void => {
      const formData = useUpsert.form.values();
      _useConfirmDialog.confirmAction(() => deleteACASII(formData), {
        onNo: () => onModalClose(formData),
        message: 'Are you sure you want to remove all ACAS Information?',
        title: 'Confirm Delete',
        onClose: () => onModalClose(formData),
      });
    };

    const { acasiIdataIsRqrd, acasiiAdditionalInformations } = useUpsert.form.values();

    const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
      if (fieldKey === 'acasiIdataIsRqrd') {
        if (!value && acasiiAdditionalInformations.length) {
          confirmRemoveACASInformation();
        }
      }
      useUpsert.onValueChange(value, fieldKey);
    };

    const groupInputControls = (): IGroupInputControls[] => [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'acasiiEquippedTCASVersion',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'tcasRqrdFL',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'rvsmSeparationMin',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'rvsmLowerFL',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'rvsmUpperFL',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'rvsmItem10',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'is833KHzChnlSpaceRqrd',
            type: EDITOR_TYPES.CHECKBOX,
          },
          {
            fieldKey: 'adsbRqrdAboveFL',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'acasiiOrTCAS',
            multiple: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _basePermitStore.flightOperationalCategories,
          },
          {
            fieldKey: 'rvsmComplianceExceptions',
            multiple: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _basePermitStore.purposeOfFlight,
          },
          {
            fieldKey: 'bannedAircrafts',
            multiple: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _baseAircraftStore.bannedAircraft,
          },
          {
            fieldKey: 'noiseRestrictedAircrafts',
            multiple: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _baseAircraftStore.noiseChapters,
          },
          {
            fieldKey: 'documentsRequiredforFilings',
            multiple: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _entityMapStore?.documents,
          },
          {
            fieldKey: 'appliedItem18Contents',
            multiple: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _entityMapStore?.item18Contents,
          },
          {
            fieldKey: 'appliedRequiredAircraftEquipments',
            multiple: true,
            type: EDITOR_TYPES.DROPDOWN,
            options: _entityMapStore?.aircraftEquipments,
          },
          {
            fieldKey: 'acasiIdataIsRqrd',
            type: EDITOR_TYPES.CHECKBOX,
          },
        ],
      },
    ];
    const updateRowEditing = (isEditing: boolean): void => {
      onRowEditingChange(isEditing);
    };

    return (
      <>
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={fieldKey => useUpsert.getField(fieldKey)}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.isLoading}
          onValueChange={onValueChange}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
        />
        <FlightPlanningACASGrid
          isEditable={(useUpsert.isEditable || !useUpsert.isDetailView) && acasiIdataIsRqrd}
          acasiIdataIsRqrd={acasiIdataIsRqrd}
          acasiiAdditionalInformations={acasiiAdditionalInformations}
          onDataSave={acasiiInfo => updateACASIIInfo(acasiiInfo)}
          onRowEditingChange={isEditing => updateRowEditing(isEditing)}
          useUpsert={useUpsert}
        />
      </>
    );
  }
);

// eslint-disable-next-line max-len
export default withFormFields(
  inject(
    'operationalRequirementStore',
    'basePermitStore',
    'baseAircraftStore',
    'countryStore',
    'entityMapStore'
  )(FlightPlanning),
  flightPlanningFields
);
