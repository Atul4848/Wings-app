import React, { FC, ReactNode, useEffect } from 'react';
import {
  AirportLocationModel,
  TimeZoneDetailStore,
  TimeZoneSettingsStore,
  TimeZoneStore,
} from '../../Shared';
import { EditDialog, ModelStatusOptions, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router-dom';
import { fields } from './Fields';
import { useGeographicModuleSecurity } from '../../Shared/Tools';
import { GRID_ACTIONS, IOptionValue, UIStore, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { AlertStore } from '@uvgo-shared/alert';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import { observer } from 'mobx-react';

interface Props {
  timeZoneDetailStore?: TimeZoneDetailStore;
  timeZoneSettingsStore?: TimeZoneSettingsStore;
  timeZoneStore?: TimeZoneStore;
  airportLocationModel: AirportLocationModel;
  onUpsertAirportTimezone: (updatedModel: AirportLocationModel) => void;
  viewMode: VIEW_MODE;
}

const UpsertAirportTimezone: FC<Props> = ({
  timeZoneDetailStore,
  airportLocationModel,
  timeZoneSettingsStore,
  timeZoneStore,
  viewMode,
  ...props
}: Props) => {
  const tabs: string[] = [ 'Airport Time Zone Details' ];
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<AirportLocationModel>(params, fields, baseEntitySearchFilters);
  const _settingsStore = timeZoneSettingsStore as TimeZoneSettingsStore;
  const _timeZoneDetailStore = timeZoneDetailStore as TimeZoneDetailStore;
  const _timeZoneStore = timeZoneStore as TimeZoneStore;
  const isRegionUpdate = Utilities.isEqual(viewMode, VIEW_MODE.PREVIEW);
  const initialView = isRegionUpdate ? VIEW_MODE.EDIT : (viewMode.toUpperCase() as VIEW_MODE);
  const geographicModuleSecurity = useGeographicModuleSecurity();

  /* istanbul ignore next */
  useEffect(() => {
    useUpsert.setViewMode(initialView || VIEW_MODE.EDIT);
    useUpsert.setFormValues(airportLocationModel);
  }, []);

  /* istanbul ignore next */
  const upsertAirportTimezone = (): void => {
    const requestModel: AirportLocationModel = new AirportLocationModel({
      ...airportLocationModel,
      ...useUpsert.form.values(),
    });
    useUpsert.setIsLoading(true);
    const upsertRequest = isRegionUpdate
      ? _timeZoneDetailStore.updateTimezoneRegion(requestModel.serialize())
      : _timeZoneDetailStore.upsertAirportTimezone(requestModel.serialize());
    upsertRequest
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => useUpsert.setIsLoading(false))
      )
      .subscribe({
        next: resp => {
          props.onUpsertAirportTimezone(resp);
          ModalStore.close();
        },
        error: error => AlertStore.critical(error.message),
      });
  };

  // Auto populate latitudeDegrees longitudeDegrees from selected Airport
  /* istanbul ignore next */
  const populateLatLongDegrees = (): void => {
    const airport = useUpsert.getField('airport').value;
    if (!airport?.id) {
      return;
    }
    const latitude = parseFloat(airport?.latitudeCoordinate?.latitude);
    const longitude = parseFloat(airport?.longitudeCoordinate?.longitude);
    useUpsert.getField('latitudeDegrees').set(latitude || 0);
    useUpsert.getField('longitudeDegrees').set(longitude || 0);
  };

  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'airport',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneDetailStore.wingsAirports,
            isDisabled: isRegionUpdate || useUpsert.isEditView,
          },
          {
            fieldKey: 'timezoneRegion',
            type: EDITOR_TYPES.DROPDOWN,
            options: _timeZoneStore.timeZoneRegions,
            isDisabled: useUpsert.isEditView && !isRegionUpdate,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'latitudeDegrees',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
          },
          {
            fieldKey: 'longitudeDegrees',
            type: EDITOR_TYPES.TEXT_FIELD,
            isDisabled: true,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'accessLevel',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.accessLevels,
            isDisabled: isRegionUpdate || useUpsert.isEditView,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
            isDisabled: isRegionUpdate || useUpsert.isEditView,
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
            isDisabled: isRegionUpdate || useUpsert.isEditView,
          },
        ],
      },
    ];
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
    if (fieldKey === 'airport') {
      if (!value) {
        useUpsert.clearFormFields([ 'latitudeDegrees', 'longitudeDegrees' ]);
      }
      populateLatLongDegrees();
    }
  };

  /* istanbul ignore next */
  // Search Entity based on field value
  const onSearch = (searchValue: string, fieldKey: string): void => {
    if (Utilities.isEqual(fieldKey, 'airport')) {
      UIStore.setPageLoader(true);
      _timeZoneDetailStore
        .searchWingsAirports(searchValue)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => UIStore.setPageLoader(false))
        )
        .subscribe();
    }
  };

  /* istanbul ignore next */
  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'timezoneRegion':
        useUpsert.observeSearch(_timeZoneStore.loadTimeZoneRegion());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  const onCancel = (model: AirportLocationModel): void => {
    if (useUpsert.viewMode === VIEW_MODE.NEW || viewMode === VIEW_MODE.EDIT || viewMode === VIEW_MODE.PREVIEW) {
      ModalStore.close();
      return;
    }
    useUpsert.setViewMode(VIEW_MODE.DETAILS);
    useUpsert.setFormValues(model);
  };

  const onAction = (gridAction: GRID_ACTIONS): void => {
    switch (gridAction) {
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.SAVE:
        upsertAirportTimezone();
        break;
      case GRID_ACTIONS.CANCEL:
        onCancel(airportLocationModel);
        break;
    }
  };

  const dialogContent = (): ReactNode => {
    return (
      <>
        <ViewInputControlsGroup
          groupInputControls={groupInputControls()}
          field={fieldKey => useUpsert.getField(fieldKey)}
          isEditing={useUpsert.isEditable}
          isLoading={useUpsert.isLoading}
          onValueChange={(option: IOptionValue, fieldKey: string) => onValueChange(option, fieldKey)}
          onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
          onFocus={(fieldKey: string) => onFocus(fieldKey)}
        />
        <AuditFields
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
          isNew={useUpsert.isAddNew}
        />
      </>
    );
  };

  return (
    <EditDialog
      tabs={tabs}
      title="Airport Time Zone Details"
      noTabs={true}
      isEditable={useUpsert.isEditable}
      hasErrors={useUpsert.isActionDisabled}
      isLoading={useUpsert.isLoading}
      hasEditPermission={geographicModuleSecurity.isEditable}
      onAction={action => onAction(action)}
      tabContent={dialogContent}
    />
  );
};

export default observer(UpsertAirportTimezone);
