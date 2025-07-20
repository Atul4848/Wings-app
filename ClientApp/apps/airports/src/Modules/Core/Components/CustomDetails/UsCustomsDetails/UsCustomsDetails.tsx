import React, { useEffect, useMemo, useState } from 'react';
import { BasePermitStore, IUseUpsert, withFormFields } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { useStyles } from './UsCustomsDetails.styles';
import { usFields } from './fields';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import {
  AirportStore,
  AirportModel,
  AirportSettingsStore,
  EntityMapStore,
  AirportCustomDetailStore,
} from '../../../../Shared';
import { getYesNoNullToBoolean, IdNameCodeModel, IOptionValue, UIStore, Utilities } from '@wings-shared/core';
import { AxiosError } from 'axios';
import { takeUntil, finalize } from 'rxjs/operators';
import { useConfirmDialog, useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router';

interface Props {
  useUpsert: IUseUpsert;
  airportStore?: AirportStore;
  airportSettingsStore?: AirportSettingsStore;
  airportCustomDetailStore?: AirportCustomDetailStore;
  entityMapStore?: EntityMapStore;
}

const UsCustomsDetails = ({ useUpsert, ...props }: Props) => {
  const classes = useStyles();
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const [ vendorLocations, setVendorLocations ] = useState<IdNameCodeModel[]>([]);
  const _airportStore = props.airportStore as AirportStore;
  const _airportSettingsStore = props.airportSettingsStore as AirportSettingsStore;
  const _entityMapStore = props.entityMapStore as EntityMapStore;
  const _customDetailStore = props.airportCustomDetailStore as AirportCustomDetailStore;
  const selectedAirport: AirportModel = _airportStore.selectedAirport as AirportModel;
  const _permitStore = useMemo(() => new BasePermitStore(), []);
  const _useConfirmDialog = useConfirmDialog();
  const isPreClearance = () => Utilities.isEqual(useUpsert.getField('cbpPortType').value?.label, 'Pre-Clearance');

  /* istanbul ignore next */
  useEffect(() => {
    loadInitialData();
    return () => {
      useUpsert.form.reset();
    };
  }, []);

  /* istanbul ignore next */
  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    _customDetailStore
      .getCustomsUsInfo(Number(params.airportId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          props.airportStore?.setSelectedAirport({
            ...selectedAirport,
            customsUsInfo: response,
          });
          useUpsert.setFormValues(response);
        },
        error: (error: AxiosError) => console.log('error', error.code),
      });
  };

  const isAddNew = (): boolean => {
    const { customsUsInfo } = _airportStore.selectedAirport as AirportModel;
    return useUpsert.isAddNew || !Boolean(customsUsInfo?.id);
  };

  const onFocus = (fieldKey: string) => {
    switch (fieldKey) {
      case 'cbpPortType':
        useUpsert.observeSearch(_airportSettingsStore.loadCbpPortTypes());
        break;
      case 'areaPortAssignment':
        useUpsert.observeSearch(_airportSettingsStore.loadAreaPortAssignments());
        break;
      case 'fieldOfficeOversight':
        useUpsert.observeSearch(_airportSettingsStore.loadFieldOfficeOversights());
        break;
      case 'preClearanceDocuments':
        useUpsert.observeSearch(_permitStore.getPermitDocuments());
        break;
      case 'clearanceFBOs':
        const _vendorLocations = _airportStore.selectedAirport?.vendorLocations?.map(x => new IdNameCodeModel(x)) || [];
        setVendorLocations(_vendorLocations);
        break;
      default:
        useUpsert.observeSearch(_entityMapStore.loadEntities(fieldKey));
    }
  };

  const onSearch = (searchValue: string, fieldKey: string) => {
    switch (fieldKey) {
      case 'contact':
        useUpsert.observeSearch(_customDetailStore.getCustomsContactNoSql(searchValue));
        break;
      default:
        useUpsert.observeSearch(_entityMapStore.searchEntities(searchValue, fieldKey));
    }
  };

  const clearPreClearance = () => {
    useUpsert.clearFormFields([
      'clearanceFBOs',
      'preClearCustomsLocations',
      'preClearClearanceLocation',
      'preClearanceDocuments',
      'preClearRequiredInformation',
      'isPreClearInternationalTrash',
      'preClearUWAProcessNotes',
      'preClearCustomsClearanceProcess',
      'preClearSpecialInstruction',
    ]);
    useUpsert.getField('isPreClearInternationalTrash').set(null);
  };

  const isPreClearFieldsEmpty = () => {
    const {
      clearanceFBOs,
      preClearCustomsLocations,
      preClearClearanceLocation,
      preClearanceDocuments,
      preClearRequiredInformation,
      isPreClearInternationalTrash,
      preClearUWAProcessNotes,
      preClearCustomsClearanceProcess,
      preClearSpecialInstruction,
    } = useUpsert.form.values();
    return (
      !clearanceFBOs?.value &&
      !preClearCustomsLocations.length &&
      !preClearClearanceLocation &&
      !preClearanceDocuments.length &&
      !preClearRequiredInformation &&
      getYesNoNullToBoolean(isPreClearInternationalTrash) === null &&
      !preClearUWAProcessNotes &&
      !preClearCustomsClearanceProcess &&
      !preClearSpecialInstruction
    );
  };

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string) => {
    if (fieldKey === 'cbpPortType') {
      if (!value && !isPreClearance()) return;
      if (isPreClearance() && !isPreClearFieldsEmpty()) {
        _useConfirmDialog.confirmAction(
          () => {
            clearPreClearance();
            useUpsert.onValueChange(value, fieldKey);
            ModalStore.close();
          },
          {
            onNo: () => ModalStore.close(),
            title: 'Confirm Change',
            message: 'Changing the CBP Port Type will clear all fields related to Pre-Clearance',
            onClose: () => ModalStore.close(),
          }
        );
        return;
      }
    }
    useUpsert.onValueChange(value, fieldKey);
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'cbpPortType',
          type: EDITOR_TYPES.DROPDOWN,
          options: _airportSettingsStore.cbpPortTypes,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'cbpFactUrl',
          type: EDITOR_TYPES.TEXT_FIELD,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'biometricCapabilitiesForeignNationals',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
      ],
    },
    {
      title: 'Port Information:',
      inputControls: [
        {
          fieldKey: 'areaPortAssignment',
          type: EDITOR_TYPES.DROPDOWN,
          options: _airportSettingsStore.areaPortAssignments,
        },
        {
          fieldKey: 'fieldOfficeOversight',
          type: EDITOR_TYPES.DROPDOWN,
          options: _airportSettingsStore.fieldOfficeOversights,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'satelliteLocation',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'driveTimeInMinutes',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    },
    {
      title: 'Pre-Clear',
      isCollapsibleGroup: true,
      inputControls: [],
      collapsibleInputControls: [
        {
          fieldKey: 'preClearCustomsLocations',
          type: EDITOR_TYPES.DROPDOWN,
          multiple: true,
          options: _entityMapStore.customLocation,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'clearanceFBOs',
          type: EDITOR_TYPES.DROPDOWN,
          options: vendorLocations,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'preClearClearanceLocation',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'preClearanceDocuments',
          type: EDITOR_TYPES.DROPDOWN,
          options: _permitStore.permitDocuments,
          multiple: true,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'preClearRequiredInformation',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'isPreClearInternationalTrash',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'preClearUWAProcessNotes',
          type: EDITOR_TYPES.TEXT_FIELD,
          multiline: true,
          isFullFlex: true,
          rows: 2,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'preClearCustomsClearanceProcess',
          type: EDITOR_TYPES.TEXT_FIELD,
          multiline: true,
          isFullFlex: true,
          rows: 3,
          isDisabled: !isPreClearance(),
        },
        {
          fieldKey: 'preClearSpecialInstruction',
          type: EDITOR_TYPES.TEXT_FIELD,
          multiline: true,
          isFullFlex: true,
          rows: 3,
          isDisabled: !isPreClearance(),
        },
      ],
    },
    {
      title: 'Reimbursable Services Program (RSP):',
      inputControls: [
        {
          fieldKey: 'reimbursableServicesProgram.subscribedAirport',
          type: EDITOR_TYPES.SELECT_CONTROL,
          isBoolean: true,
          containerClass: classes.containerClass,
        },
        {
          fieldKey: 'reimbursableServicesProgram.contact',
          type: EDITOR_TYPES.DROPDOWN,
          options: _customDetailStore.customsContactNoSql,
        },
        {
          fieldKey: 'reimbursableServicesProgram.instructions',
          type: EDITOR_TYPES.TEXT_FIELD,
          multiline: true,
          isFullFlex: true,
          rows: 3,
        },
      ],
    },
  ];

  return (
    <>
      <ViewInputControlsGroup
        groupInputControls={groupInputControls()}
        field={useUpsert.getField}
        isEditing={useUpsert.isEditable}
        isLoading={useUpsert.isLoading}
        onValueChange={onValueChange}
        onFocus={onFocus}
        onSearch={onSearch}
      />
      <AuditFields
        isNew={isAddNew()}
        isEditable={useUpsert.isEditable}
        fieldControls={useUpsert.auditFields}
        onGetField={useUpsert.getField}
      />
    </>
  );
};

export default withFormFields(
  inject(
    'airportStore',
    'airportSettingsStore',
    'entityMapStore',
    'airportCustomDetailStore'
  )(observer(UsCustomsDetails)),
  usFields
);
