import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import {
  DATE_FORMAT,
  GRID_ACTIONS,
  IAPIGridRequest,
  IOptionValue,
  UIStore,
  Utilities,
  baseEntitySearchFilters,
} from '@wings-shared/core';
import {
  AirportSettingsStore,
  AirportStore,
  useAirportModuleSecurity,
  AirportPermissionModel,
  EntityMapStore,
  AirportModel,
  updateAirportSidebarOptions,
  airportBasePath,
} from '../../../../../Shared';
import { fields } from './Fields';
import { observable } from 'mobx';
import { Box } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { AlertStore } from '@uvgo-shared/alert';
import { useUnsubscribe } from '@wings-shared/hooks';
import { finalize, takeUntil } from 'rxjs/operators';
import { useNavigate, useParams } from 'react-router';
import { useStyles } from './UpsertAirportPermission.styles';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import PermissionTolerance from '../PermissionTolerance/PermissionTolerance';
import PermissionLeadTimes from '../PermissionLeadTimes/PermissionLeadTimes';
import PermissionExceptions from '../PermissionExceptions/PermissionExceptions';
import { ModelStatusOptions, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { AuditFields, EDITOR_TYPES, IGroupInputControls, ViewInputControlsGroup } from '@wings-shared/form-controls';
import {
  ConfirmNavigate,
  DetailsEditorHeaderSection,
  DetailsEditorWrapper,
  SidebarStore,
  ConfirmDialog,
} from '@wings-shared/layout';

interface Props {
  airportStore?: AirportStore;
  sidebarStore?: typeof SidebarStore;
  airportSettingsStore?: AirportSettingsStore;
  entityMapStore?: EntityMapStore;
  viewMode: VIEW_MODE;
}

const UpsertAirportPermission: FC<Props> = ({ ...props }: Props) => {
  const params = useParams();
  const { headerActionsEditMode, editorWrapperContainer } = useStyles();
  const navigate = useNavigate();
  const unsubscribe = useUnsubscribe();
  const _entityMapStore = props.entityMapStore as EntityMapStore;
  const _airportStore = props.airportStore as AirportStore;
  const _settingsStore = props.airportSettingsStore as AirportSettingsStore;
  const _sidebarStore = props.sidebarStore as typeof SidebarStore;
  const _selectedAirport = _airportStore.selectedAirport as AirportModel;
  const { isEditable } = useAirportModuleSecurity();
  const [ isRowEditing, setIsRowEditing ] = useState(false);
  const [ isDataUpdated, setDataUpdate ] = useState(false);
  const [ permissionDetails, setPermissionDetails ] = useState(new AirportPermissionModel());
  const useUpsert = useBaseUpsertComponent<AirportPermissionModel>(params, fields, baseEntitySearchFilters);
  const _observable = useRef(observable({ editingGrids: [] as string[] })).current;
  const { airportId } = useParams();

  /* istanbul ignore next */
  useEffect(() => {
    const { airportId, icao, permissionViewMode } = params;
    useUpsert.setViewMode((permissionViewMode?.toUpperCase() as VIEW_MODE) || VIEW_MODE.EDIT);
    _sidebarStore.setNavLinks(
      updateAirportSidebarOptions('Airport Permissions', !Boolean(airportId)),
      airportBasePath(airportId, icao, props.viewMode)
    );
    getAirportPermission();
  }, []);

  /* istanbul ignore next */
  const getAirportPermission = (): void => {
    if (!Boolean(params.permissionId)) {
      useUpsert.setFormValues(new AirportPermissionModel());
      return;
    }
    const request: IAPIGridRequest = {
      filterCollection: JSON.stringify([ Utilities.getFilter('PermissionId', params?.permissionId) ]),
    };
    UIStore.setPageLoader(true);
    _airportStore
      .getAirportPermissions(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(response => {
        const item = response.results[0];
        if (!item) {
          AlertStore.important(`Airport Permission not found for Id ${params?.permissionId}`);
          return;
        }
        setPermissionDetails(item);
        useUpsert.setFormValues(item);
      });
  };

  const upsertAirportPermission = (): void => {
    const permissionId = Number(params?.permissionId) || 0;
    const model = new AirportPermissionModel({
      ...permissionDetails,
      ...useUpsert.form.values(),
      airportId: Number(airportId),
    });
    UIStore.setPageLoader(true);
    _airportStore
      .upsertAirportPermission(model.serialize(permissionId))
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: response => {
          setPermissionDetails(response);
          useUpsert.form.reset();
          useUpsert.setFormValues(response);
          if (!model?.id) {
            const { airportId, icao } = params;
            setTimeout(() => {
              navigate(
                `/airports/upsert/${airportId}/${icao}/${props.viewMode}/airport-permissions/${response.id}/edit`,
                {
                  replace: true,
                }
              );
            }, 1000);
          }
        },
        error: error => useUpsert.showAlert(error.message, 'upsertAirportPermission'),
      });
  };

  const updatePermisionData = (gridName, gridData): void => {
    const formData = useUpsert.form.values();
    useUpsert.setFormValues({ ...formData, [gridName]: gridData });
    setDataUpdate(true);
  };

  /* istanbul ignore next */
  const navigateToAirportPermissions = (): void => {
    if (Boolean(params)) {
      const { airportId, icao } = params;
      navigate(`/airports/upsert/${airportId}/${icao}/${props.viewMode}/airport-permissions`, useUpsert.noBlocker);
      props.sidebarStore?.setNavLinks(
        updateAirportSidebarOptions('Airport Permissions', !Boolean(params.airportId)),
        airportBasePath(airportId, icao, props.viewMode)
      );
    }
  };

  const onCancel = (): void => {
    const _mode = params.permissionViewMode as VIEW_MODE;
    if (_mode.toUpperCase() === VIEW_MODE.DETAILS) {
      useUpsert.setViewMode(VIEW_MODE.DETAILS);
      useUpsert.form.reset();
      useUpsert.setFormValues(permissionDetails);
      return;
    }
    navigateToAirportPermissions();
  };

  const confirmClose = (): void => {
    if (params?.permissionViewMode?.toUpperCase() === VIEW_MODE.DETAILS) {
      if (!useUpsert.form.touched) {
        onCancel();
        return;
      }
      ModalStore.open(
        <ConfirmDialog
          title="Confirm Cancellation"
          message="Leaving Edit Mode will cause your changes to be lost. Are you sure you want to exit Edit Mode?"
          yesButton="Yes"
          onNoClick={() => {
            ModalStore.close();
          }}
          onYesClick={() => {
            onCancel();
            ModalStore.close();
          }}
        />
      );
      return;
    }
    navigateToAirportPermissions();
    return;
  };

  /* istanbul ignore next */
  const updateRowEditing = (isEditing: boolean, girdName: string): void => {
    const _editingGrids = _observable.editingGrids.filter(grid => !Utilities.isEqual(grid, girdName));
    if (isEditing) {
      _editingGrids.push(girdName);
    }
    _observable.editingGrids = _editingGrids;
  };

  const onAction = (action: GRID_ACTIONS): void => {
    switch (action) {
      case GRID_ACTIONS.SAVE:
        upsertAirportPermission();
        break;
      case GRID_ACTIONS.EDIT:
        useUpsert.setViewMode(VIEW_MODE.EDIT);
        break;
      case GRID_ACTIONS.CANCEL:
      default:
        confirmClose();
        break;
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const onFocus = (fieldKey: string): void => {
    switch (fieldKey) {
      case 'permissionType':
        useUpsert.observeSearch(_settingsStore.loadPermissionTypes());
        break;
      case 'notificationType':
        useUpsert.observeSearch(_settingsStore.loadNotificationTypes());
        break;
      case 'confirmationRequiredFors':
        useUpsert.observeSearch(_settingsStore.loadConfirmationRequiredFor());
        break;
      case 'permissionRequiredFors':
        useUpsert.observeSearch(_settingsStore.loadRequiredFor());
        break;
      case 'pprPurposes':
        useUpsert.observeSearch(_settingsStore.loadPPRPurpose());
        break;
      case 'documents':
        useUpsert.observeSearch(_settingsStore.loadDocuments());
        break;
      case 'accessLevel':
        useUpsert.observeSearch(_settingsStore.getAccessLevels());
        break;
      case 'sourceType':
        useUpsert.observeSearch(_settingsStore.getSourceTypes());
        break;
    }
  };

  const onSearch = (searchValue: string, fieldKey: string) => {
    useUpsert.observeSearch(_entityMapStore.searchEntities(searchValue, fieldKey));
  };

  const disableAction = () => {
    if (Boolean(_observable.editingGrids.length)) {
      return true;
    }
    if (isDataUpdated) {
      return useUpsert.form.hasError || UIStore.pageLoading || Boolean(_observable.editingGrids.length);
    }
    return useUpsert.isActionDisabled;
  };

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls[] => {
    return [
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'permissionType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.permissionTypes,
          },
          {
            fieldKey: 'permissionRequiredFors',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.requiredFor,
            multiple: true,
          },
          {
            fieldKey: 'pprPurposes',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.pprPurpose,
            multiple: true,
          },
          {
            fieldKey: 'airportGABAMaxArrivalSlotsPerDay',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'airportGABAMaxDepartureSlotsPerDay',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'gabaNightSlotsAvailable',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'gabaPeakHourSlotsAvailable',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'notificationType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.notificationTypes,
          },
          {
            fieldKey: 'confirmationRequiredFors',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.confirmationRequiredFor,
            multiple: true,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'startDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            maxDate: useUpsert.getField('endDate')?.value,
          },
          {
            fieldKey: 'endDate',
            type: EDITOR_TYPES.DATE,
            dateTimeFormat: DATE_FORMAT.DATE_PICKER_FORMAT,
            minDate: useUpsert.getField('startDate')?.value,
          },
        ],
      },
      {
        title: '',
        inputControls: [
          {
            fieldKey: 'idNumberIssued',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'idNumberRequiredInFlightPlan',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'idNumberItem18Format',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'documentsRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'documents',
            type: EDITOR_TYPES.DROPDOWN,
            multiple: true,
            options: _settingsStore.documents,
          },
          {
            fieldKey: 'slotAndPPRJointApproval',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'specialFormsRequired',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'formLink',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'templateID',
            type: EDITOR_TYPES.TEXT_FIELD,
          },
          {
            fieldKey: 'tbAorOpenScheduleAllowed',
            type: EDITOR_TYPES.SELECT_CONTROL,
            isBoolean: true,
          },
          {
            fieldKey: 'permissionVendors',
            type: EDITOR_TYPES.DROPDOWN,
            options: _entityMapStore.vendors,
            isServerSideSearch: true,
            multiple: true,
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
          },
          {
            fieldKey: 'status',
            type: EDITOR_TYPES.DROPDOWN,
            options: ModelStatusOptions,
          },
          {
            fieldKey: 'sourceType',
            type: EDITOR_TYPES.DROPDOWN,
            options: _settingsStore.sourceTypes,
          },
        ],
      },
    ];
  };
  /* istanbul ignore next */
  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={_selectedAirport?.title}
        backNavTitle="Airport Permissions"
        disableActions={disableAction()}
        isEditMode={useUpsert.isEditable}
        hasEditPermission={Boolean(isEditable && _selectedAirport?.isActive)}
        onAction={action => onAction(action)}
        isRowEditing={isRowEditing}
        showBreadcrumb={true}
      />
    );
  };

  const { permissionLeadTimes, permissionExceptions, permissionTolerances } = useUpsert.form.values();
  return (
    <ConfirmNavigate isBlocker={useUpsert.form.changed}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isBreadCrumb={true}
        isEditMode={useUpsert.isEditable}
        classes={{ container: editorWrapperContainer, headerActionsEditMode }}
      >
        <Box>
          <ViewInputControlsGroup
            groupInputControls={groupInputControls()}
            field={useUpsert.getField}
            isEditing={useUpsert.isEditable}
            onValueChange={onValueChange}
            isLoading={UIStore.pageLoading}
            onFocus={onFocus}
            onSearch={onSearch}
          />
          <PermissionTolerance
            key={`tolerance-${useUpsert.isEditable}`}
            isEditable={useUpsert.isEditable && isEditable}
            isRowEditing={(isEditing: boolean) => {
              setIsRowEditing(isEditing);
              updateRowEditing(isEditing, 'permissionTolerances');
            }}
            tolerance={permissionTolerances}
            onGridDataUpdate={updatePermisionData}
          />
          <PermissionLeadTimes
            key={`leadTime-${useUpsert.isEditable}`}
            isEditable={useUpsert.isEditable && isEditable}
            isRowEditing={(isEditing: boolean) => {
              setIsRowEditing(isEditing);
              updateRowEditing(isEditing, 'permissionLeadTimes');
            }}
            leadTimes={permissionLeadTimes}
            onGridDataUpdate={updatePermisionData}
          />
          <PermissionExceptions
            key={`exception-${useUpsert.isEditable}`}
            isEditable={useUpsert.isEditable && isEditable}
            isRowEditing={(isEditing: boolean) => {
              setIsRowEditing(isEditing);
              updateRowEditing(isEditing, 'permissionExceptions');
            }}
            exceptions={permissionExceptions}
            onGridDataUpdate={updatePermisionData}
          />
        </Box>
        <AuditFields
          isNew={useUpsert.isAddNew}
          isEditable={useUpsert.isEditable}
          fieldControls={useUpsert.auditFields}
          onGetField={useUpsert.getField}
        />
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject(
  'airportStore',
  'airportSettingsStore',
  'sidebarStore',
  'entityMapStore'
)(observer(UpsertAirportPermission));
